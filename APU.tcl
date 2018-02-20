#
# Administrador de APU en forma de arbol
#
# Variables
#   popupmenu - el menu que se despliega al dar click sobre la imagen
#   scrolledwindow - el contenedor scrollable - utilice mejor la definicion
#                    de tree
#   tree - el arbol propiamente
#   lastPopupId - la ultima entrada emergida por el popupmenu
#
# Procedimientos
#   open'leaf - expande una rama del arbol
#   open'popupmenu - desplega el popupmenu (expandir/agregar/eliminar)
#
#   begin'create - inicial el proceso de creacion (dirty) de nueva entrada
#   begin'edit - transforma una hoja del arbol en entry y redacta la descripcion
#   finish'edit
#
#   create'node
#   delete'node - elimina una hoja o una rama del arbol
#
#   'do'select
#   'do'delete
#   'do'update
#   'do'insert
#
namespace eval APU {
  set popupmenu [menu .popupmenu -tearoff false]
  set lastPopupId {}

  $popupmenu add command -label "Agregar" -command APU::begin'create
  $popupmenu add separator
  $popupmenu add command -label "Eliminar" -command APU::delete'node
  $popupmenu add separator
  $popupmenu add command -label "Renombrar" -command APU::begin'edit

  set event [dict create \
    query [json::write string select] \
    module [json::write string APU] \
    parent null \
  ]
  chan puts $MAIN::chan [json::write object {*}$event]
}

proc APU::create { scrolledwindow } {
  variable tree [Tree [$scrolledwindow getframe].tree -opencmd APU::open'leaf \
    -showlines true -deltay 18 -bd 0]
}

proc APU::setupBinds { onopen onedit onpopup } {
  variable tree
  # hacer que redactar sea presionando por un rato
  #$tree bindText <1> $onopen
  #$tree bindText <Double-1> $onedit
  $tree bindText <1> [list viewAPUSupplies::open'view .centerpanel]
  $tree bindImage <1> $onpopup
}

#
# Despliega el popupmenu el cual contiene incialmente las acciones
#  - Expandir
#  - Agregar
#  - Eliminar
#
# Parametros
#   x - la posicion X del cursor al momento de dar click
#   y - el mismo concepto de X
#   entry - la entrada sobre la cual se dio click
#
# Modifica la variable
#   lastPopupId - guarda $entry
#
proc APU::open'popupmenu { x y entry } {
  variable popupmenu
  variable tree
  variable lastPopupId $entry
  $popupmenu entryconfigure 0 -label "Agregar"
  array set e [deserialize [lindex [$tree itemconfigure $entry -data] 4]]
  if { [lindex [$tree itemconfigure $entry -open] 4] == 0 && \
       [lindex [array get e expand] 1] == true } {
    $popupmenu entryconfigure 0 -label "Expandir"
  }
  tk_popup $popupmenu $x $y
}

proc APU::delete'node { } {
  variable tree
  variable lastPopupId

  $tree itemconfigure $lastPopupId -text "..."
  set event [dict create \
    query [json::write string delete] \
    module [json::write string APU] \
    idkey [json::write string id] \
    id [json::write string $lastPopupId] \
  ]
  chan puts $MAIN::chan [json::write object {*}$event]
}

proc APU::create'node { data input } {
  variable tree
  array set entry [deserialize $data]

  $tree itemconfigure $entry(id) -text "$entry(id) ..."
  set entry(description) $input

  if { $input == "" } {
    $tree delete $entry(id)
  } else {
    set event [dict create \
      query [json::write string insert] \
      module [json::write string APU] \
      row [json::write object \
        id [json::write string $entry(id)] \
        description [json::write string $entry(description)] \
        parent [json::write string $entry(parent)] \
      ] \
    ]
    chan puts $MAIN::chan [json::write object {*}$event]
  }
  return 1
}

proc APU::begin'create { } {
  variable tree
  variable lastPopupId

  array set data [deserialize [lindex \
    [$tree itemconfigure $lastPopupId -data] 4]]
  if { [lindex [$tree itemconfigure $lastPopupId -open] 4] == 0 && \
       [lindex [array get data expand] 1] == true  } {
    $tree opentree $lastPopupId 0
    return
  }
  set newId "$data(id).[ expr { [llength [$tree nodes $lastPopupId]] + 1 }]"
  set data(parent) $data(id)
  set data(id) $newId
  set data(description) ""
  array unset data expand

  $tree insert end $data(parent) $data(id) \
    -data [array get data] \
    -image [Bitmap::get oplink]

  $tree opentree $data(parent) false
  $tree edit $data(id) "..." [list APU::create'node [array get data]] 1
}

proc APU::open'leaf { id } {
  variable tree
  set event [dict create \
    query [json::write string select] \
    module [json::write string APU] \
    from [json::write string APU] \
    parent [json::write string $id] \
  ]
  chan puts $MAIN::chan [json::write object {*}$event]
}

proc APU::begin'edit { } {
  variable tree
  variable lastPopupId

  array set entry [deserialize [$tree itemcget $lastPopupId -data]]
  $tree edit $lastPopupId [lindex [array get entry description] 1] \
    [list APU::finish'edit $lastPopupId] 1
}

proc APU::finish'edit { node newText } {
  variable tree
  $tree itemconfigure $node -text "..."
  set event [dict create \
    query [json::write string update] \
    module [json::write string APU] \
    id [json::write string $node] \
    idkey [json::write string id] \
    key [json::write array [json::write string description]] \
    value [json::write array [json::write string $newText]] \
  ]
  chan puts $MAIN::chan [json::write object {*}$event]
  return 1
}

proc APU::'do'update { resp } {
  variable tree
  upvar $resp response
  if { [string range $response(id) 0 0] != "-" } {
    return
  }
  if [$tree exists $response(id)] {
    array set entry [deserialize $response(row)]
    set bgcolori [regexp -all {[.]} $response(id)]
    set bgc black
    if { $bgcolori == 0 } {
      set bgc brown
    }
    if { $bgcolori == 1 } {
      set bgc red
    }
    if { $bgcolori == 2 } {
      set bgc blue
    }
    if { $bgcolori == 3 } {
      set bgc green4
    }
    if { [array get response expand] == "expand false" } {
      set bgc black
    }
    $tree itemconfigure $entry(id) \
      -text "$entry(id) $entry(description)" \
      -data [array get entry] -fill $bgc
  }
}

proc APU::'do'delete { resp } {
  variable tree
  upvar $resp response
  if { [string range $response(id) 0 0] != "-" } {
    return
  }
  if [$tree exists $response(id)] {
    $tree delete $response(id)
  }

}

proc APU::'do'select { resp } {
  variable tree
  upvar $resp response
  array set entry [deserialize $response(row)]
  if { [string range $entry(id) 0 0] != "-" } {
    return
  }
  if [$tree exists $entry(id)] {
    $tree itemconfigure $entry(id) -data $response(row)
    return
  }
  set root root
  if { $entry(parent) != "null" } {
    set root $entry(parent)
  }
  set drawcross auto
  if { [lindex [array get entry expand] 1] == true } {
    set drawcross allways
  }
  if [$tree exists $root] {
    set bgcolori [regexp -all {[.]} $entry(id)]
    set bgc black
    if { $bgcolori == 0 } {
      set bgc brown
    }
    if { $bgcolori == 1 } {
      set bgc red
    }
    if { $bgcolori == 2 } {
      set bgc blue
    }
    if { $bgcolori == 3 } {
      set bgc green4
    }
    if { [array get entry expand] == "expand false" } {
      set bgc black
    }
    $tree insert end $root \
      $entry(id) -text "$entry(id) $entry(description)" \
        -data $response(row) -drawcross $drawcross \
        -image [Bitmap::get oplink] -fill $bgc
  }
}

proc APU::'do'insert { resp } {
  variable tree
  upvar $resp response
  array set entry [deserialize $response(row)]
  if { [string range $entry(id) 0 0] != "-" } {
    return
  }
  set bgcolori [regexp -all {[.]} $entry(id)]
  set bgc black
  if { $bgcolori == 0 } {
    set bgc brown
  }
  if { $bgcolori == 1 } {
    set bgc red
  }
  if { $bgcolori == 2 } {
    set bgc blue
  }
  if { $bgcolori == 3 } {
    set bgc green4
  }
  if { [array get entry expand] == false } {
    set bgc black
  }
  if [$tree exists $entry(id)] {
    $tree itemconfigure $entry(id) -text "$entry(id) $entry(description)" \
      -data $response(row) -image [Bitmap::get oplink] -fill $bgc
  } elseif [$tree exists $entry(parent)] {
    $tree itemconfigure $entry(parent) -drawcross allways
    $tree insert end $entry(parent) \
      $entry(id) -text "$entry(id) $entry(description)" \
        -data $response(row) -image [Bitmap::get oplink] -fill $bgc
  }
}
