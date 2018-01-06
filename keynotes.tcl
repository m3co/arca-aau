#
# Administrador de Keynotes en forma de arbol
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
namespace eval Keynotes {
  set popupmenu [menu .popupmenu -tearoff false]
  set lastPopupId {}

  $popupmenu add command -label "Agregar" -command Keynotes::begin'create
  $popupmenu add separator
  $popupmenu add command -label "Eliminar" -command Keynotes::delete'node

  set event [dict create \
    query [json::write string select] \
    module [json::write string Keynotes] \
    parent [json::write string "-"] \
  ]
  chan puts $MAIN::chan [json::write object {*}$event]
}

proc Keynotes::create { scrolledwindow } {
  variable tree [Tree [$scrolledwindow getframe].tree -opencmd Keynotes::open'leaf \
    -showlines true -deltay 18 -bd 0]
}

proc Keynotes::setupBinds { onopen onedit onpopup } {
  variable tree
  # hacer que redactar sea presionando por un rato
  $tree bindText <1> $onopen
  $tree bindText <Double-1> $onedit
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
proc Keynotes::open'popupmenu { x y entry } {
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

proc Keynotes::delete'node { } {
  variable tree
  variable lastPopupId

  $tree itemconfigure $lastPopupId -text "..."
  array set event {
    query delete
    module Keynotes
    from Keynotes
    idKey id
  }
  set event(id) $lastPopupId
  chan puts $MAIN::chan [array get event]
}

proc Keynotes::create'node { data input } {
  variable tree
  array set entry [deserialize $data]

  $tree itemconfigure $entry(id) -text "$entry(id) ..."
  set entry(description) $input

  if { $input == "" } {
    $tree delete $entry(id)
  } else {
    array set event {
      query insert
      module Keynotes
      from Keynotes
    }
    set event(row) [array get entry]
    chan puts $MAIN::chan [array get event]
  }
  return 1
}

proc Keynotes::begin'create { } {
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

  $tree opentree $data(parent) 0
  $tree edit $data(id) "" [list Keynotes::create'node [array get data]] 1
}

proc Keynotes::open'leaf { id } {
  variable tree
  set event [dict create \
    query [json::write string select] \
    module [json::write string Keynotes] \
    from [json::write string Keynotes] \
    parent [json::write string $id] \
  ]
  chan puts $MAIN::chan [json::write object {*}$event]
}

proc Keynotes::begin'edit { node } {
  variable tree
  array set entry [deserialize [$tree itemcget $node -data]]
  $tree edit $node [lindex [array get entry description] 1] \
    [list Keynotes::finish'edit $node] 1
}

proc Keynotes::finish'edit { node newText } {
  variable tree
  $tree itemconfigure $node -text "..."
  array set event {
    query update
    module Keynotes
    from Keynotes
  }
  set event(id) $node
  set event(idkey) id
  set event(key) description
  set event(value) $newText
  chan puts $MAIN::chan [array get event]
  return 1
}

proc Keynotes::'do'update { resp } {
  variable tree
  upvar $resp response
  if [$tree exists $response(id)] {
    array set entry [deserialize [lindex \
      [$tree itemconfigure $response(id) -data] 4]]
    set entry($response(key)) $response(value)
    $tree itemconfigure $response(id) -text "$response(id) $response(value)" \
      -data [array get entry]
  }
}

proc Keynotes::'do'delete { resp } {
  variable tree
  upvar $resp response
  if [$tree exists $response(id)] {
    $tree delete $response(id)
  }

}

proc Keynotes::'do'select { resp } {
  variable tree
  upvar $resp response
  array set entry [deserialize $response(row)]
  if [$tree exists $entry(id)] {
    $tree itemconfigure $entry(id) -data $response(row)
    return
  }
  set root root
  if { $entry(parent) != "" } {
    set root $entry(parent)
  }
  set drawcross auto
  if { [lindex [array get entry expand] 1] == true } {
    set drawcross allways
  }
  if [$tree exists $root] {
    $tree insert end $root \
      $entry(id) -text "$entry(id) $entry(description)" \
        -data $response(row) -drawcross $drawcross \
        -image [Bitmap::get oplink]
  }
}

proc Keynotes::'do'insert { resp } {
  variable tree
  upvar $resp response
  array set entry [deserialize $response(row)]
  if [$tree exists $entry(id)] {
    $tree itemconfigure $entry(id) -text "$entry(id) $entry(description)" \
      -data $response(row) -image [Bitmap::get oplink]
  } elseif [$tree exists $entry(parent)] {
    $tree itemconfigure $entry(parent) -drawcross allways
    $tree insert end $entry(parent) \
      $entry(id) -text "$entry(id) $entry(description)" \
        -data $response(row) -image [Bitmap::get oplink]
  }
}
