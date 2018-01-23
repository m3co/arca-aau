
proc viewAPUSupplies::input'description { e frame } {
  array set entry [deserialize $e]

  set fr $frame.description.$entry(APUSupplies_id)
  if { [winfo exists $fr] == 0 } {
    pack [frame $fr] -fill x -expand true
  }
  set label $fr.label
  if { [winfo exists $label] == 0 } {
    if { $entry(id) != "newentry" } {
      pack [label $fr.edit -text "!"] -side left
      bind $fr.edit <1> [list viewAPUSupplies::rename'description \
        %W $fr [array get entry]]
    }
    pack [label $label -text $entry(Supplies_description)] -side left
  }
  $label configure -text [expr {$entry(Supplies_description) == "" ? \
    "-" : $entry(Supplies_description) }]
  bind $label <1> [list viewAPUSupplies::turn'combobox \
    %W $fr [array get entry]]
}

proc viewAPUSupplies::rename'description { path frame e } {

  array set conf [list \
    frame $frame \
    key Supplies_description \
    module viewAPUSupplies \
    idkey id \
  ]

  labelentry::'begin'redact $frame.label [array get conf] $e
  set label $frame.label
  bind $label <1> [list viewAPUSupplies::turn'combobox \
    %W $frame $e]
}

proc viewAPUSupplies::turn'combobox { path frame e } {

  array set conf [list \
    frame $frame \
    key Supplies_description \
    module viewAPUSupplies \
    idkey id \
  ]

  array set entry [deserialize $e]
  labelentry::'end'redact [array get conf]

  set combo [ttk::combobox $frame.combo]
  $combo insert 0 $entry(Supplies_description)
  bind $combo <KeyRelease> +[list \
    viewAPUSupplies::search'combobox %W %K]
  bind $combo <<ComboboxSelected>> [list \
    viewAPUSupplies::select'combobox %W $frame.label [array get entry]]

  set labelentry::lastEdit(input) $combo
  set labelentry::lastEdit(label) $frame.label

  pack forget $path
  pack $combo -fill x -expand true
  extendcombo::setup $combo
  focus $combo
}

#
# Se espera que la lista mostrada en el combobox tenga al final de cada
# linea el formato { $texto-descriptivo [id] }. Bajo dicho formato es posible
# obtener el id del Supply seleccionado
#
proc viewAPUSupplies::select'combobox { path label e } {
  array set entry [deserialize $e]
  variable lastSearch
  variable description
  if { [llength [array names lastSearch]] == 0 } {
    #
    # El acto a seguir es, crear el insumo y luego con el insumo creado
    # actualizar la entrada de la APU
    #
    set event [dict create \
      query [json::write string insert] \
      module [json::write string Supplies] \
      row [toJSON [dict create description [$path get]] \
        [dict create description {jsontype string}]] \
    ]
    chan puts $MAIN::chan [json::write object {*}$event]

    $labelentry::lastEdit(input) configure -values [list "..."]
    $labelentry::lastEdit(input) set "..."
    return
  }
  set id [lindex [regexp -inline {\[(\d+)\]$} [$path get]] end]

  # Reemplace el insumo con el insumo seleccionado
  foreach param [list description unit cost type] {
    set entry("Supplies_$param") [dict get $lastSearch($id) $param]
    if { $entry("Supplies_$param") == "null" } {
      set entry("Supplies_$param") ""
    }
  }
  set entry(Supplies_id) $id

  set event [dict create \
    query [json::write string update] \
    module [json::write string viewAPUSupplies] \
    idkey [json::write string id] \
    id [json::write string $entry(id)] \
    key [json::write string APUSupplies_SupplyId] \
    value [json::write string [dict get $lastSearch($id) id]] \
    row [toJSON [array get entry] [array get description]] \
  ]

  if { $entry(id) == "newentry" } {
    set event ""
    set event [dict create \
      query [json::write string insert] \
      module [json::write string APUSupplies] \
      row [toJSON [list \
        APUId $entry(APU_id) \
        SupplyId [dict get $lastSearch($id) id] \
      ] [dict create APUId {jsontype string} SupplyId {jsontype integer}]] \
    ]
  }
  chan puts $MAIN::chan [json::write object {*}$event]

  $label configure -text "..."
  pack $label -side left
  destroy $path
}

#
# La lista resultante de la busqueda de insumos mostrarla en el combobox,
# y allende guardar dicho resultado en favor de viewAPUSupplies::select'combobox
#
proc viewAPUSupplies::'do'search { resp } {
  upvar $resp response
  variable lastSearch

  array unset lastSearch
  array set lastSearch {}
  set found [list]

  foreach row $response(rows) {
    array set entry [deserialize $row]
    lappend found "$entry(description) \[$entry(id)]"
    set lastSearch($entry(id)) [array get entry]
  }
  if { [llength $found] == 0 } {
    set r [lindex [regexp -inline {(.+) [[]\d+[]]$} $response(value)] end]
    if { $r == "" } {
      lappend found $response(value)
    }
  }
  $response(combo) configure -values $found
  extendcombo::show'listbox $response(combo) ""
}

proc viewAPUSupplies::search'combobox { path key } {
  if {[string length $key] > 1 && [string tolower $key] != $key} {
    return
  }
  set value [$path get]

  set event [dict create \
    query [json::write string search] \
    combo [json::write string $path] \
    module [json::write string Supplies] \
    key [json::write string description] \
    value [json::write string $value]
  ]
  chan puts $MAIN::chan [json::write object {*}$event]
}
