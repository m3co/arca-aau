
namespace eval viewAPUSupplies {

  proc setup'newentry { apu_frame r } {
    upvar $r row
    if { [winfo exists $apu_frame.supplies] == 0 } {
      pack [frame $apu_frame.supplies] -side top -fill x -expand true
      foreach param [list action type description unit cost qop partial] {
        if { $param == "partial" } {
          pack [labelframe $apu_frame.supplies.$param -text "Valor Parcial"] \
            -side left
          continue
        }
        if { $param == "action" } {
          pack [labelframe $apu_frame.supplies.$param -text "-"] -side left
          continue
        }
        if { $param == "type" } {
          pack [labelframe $apu_frame.supplies.$param -text "Tipo"] -side left
          continue
        }
        if { $param == "description" } {
          pack [labelframe $apu_frame.supplies.$param -text "Descripcion"] -side left
          continue
        }
        if { $param == "unit" } {
          pack [labelframe $apu_frame.supplies.$param -text "Unidad"] -side left
          continue
        }
        if { $param == "cost" } {
          pack [labelframe $apu_frame.supplies.$param -text "Costo"] -side left
          continue
        }
        if { $param == "qop" } {
          pack [labelframe $apu_frame.supplies.$param -text "Rdto"] -side left
          continue
        }
        pack [labelframe $apu_frame.supplies.$param -text $param] -side left
          # \ -fill x -expand [expr { $param == "description" }]
          # hace parte de la linea de arriba...
      }
    }

    if { [winfo exist $apu_frame.supplies.type.newentry] == 1 } {
      destroy $apu_frame.supplies.type.newentry
    }
    pack [frame $apu_frame.supplies.type.newentry] -side top -fill x
    pack [label $apu_frame.supplies.type.newentry.label -text " "] \
      -side left

    if { [winfo exist $apu_frame.supplies.description.newentry] == 1 } {
      destroy $apu_frame.supplies.description.newentry
    }
    array set newentry {
      id newentry
      APUSupplies_id newentry
      APUSupplies_SupplyId ""
      APUSupplies_APUId ""
      APUSupplies_qop ""
      APU_cost ""
      APU_description ""
      APU_id ""
      APU_qop ""
      APU_unit ""
      APU_estimated ""
      Supplies_cost ""
      Supplies_description ""
      Supplies_id ""
      Supplies_unit ""
      Supplies_type ""
      APU_expand ""
      APU_parent ""
      Qtakeoff_upload ""
      Qtakeoff_qop ""
    }
    set newentry(APUSupplies_APUId) $row(APUSupplies_APUId)
    set newentry(APU_id) $row(APU_id)
    input'description [array get newentry] $apu_frame.supplies

    if { [winfo exist $apu_frame.supplies.unit.newentry] == 1 } {
      destroy $apu_frame.supplies.unit.newentry
    }
    pack [frame $apu_frame.supplies.unit.newentry] -side top -fill x
    pack [label $apu_frame.supplies.unit.newentry.label -text " "] \
      -side left

    if { [winfo exist $apu_frame.supplies.cost.newentry] == 1 } {
      destroy $apu_frame.supplies.cost.newentry
    }
    pack [frame $apu_frame.supplies.cost.newentry] -side top -fill x
    pack [label $apu_frame.supplies.cost.newentry.label -text " "] \
      -side left

    if { [winfo exist $apu_frame.supplies.qop.newentry] == 1 } {
      destroy $apu_frame.supplies.qop.newentry
    }
    pack [frame $apu_frame.supplies.qop.newentry] -side top -fill x
    pack [label $apu_frame.supplies.qop.newentry.label -text " "] \
      -side left

    if { [winfo exist $apu_frame.supplies.partial.newentry] == 1 } {
      destroy $apu_frame.supplies.partial.newentry
    }
    pack [frame $apu_frame.supplies.partial.newentry] -side top -fill x
    pack [label $apu_frame.supplies.partial.newentry.label -text " "] \
      -side left

    if { [winfo exists $apu_frame.supplies.action.newentry] == 1 } {
      destroy $apu_frame.supplies.action.newentry
    }
    pack [label $apu_frame.supplies.action.newentry -text " " \
      -width 1 -relief raised]

  }

  proc 'do'select { resp } {
    variable description
    upvar $resp response

    array set row [deserialize $response(row)]
    if { [string range $row(id) 0 0] != "-" } {
      return
    }

    variable frame

    set keynote_frame $frame.[regsub -all {[.]} $row(APU_id) "_"]
    if { [winfo exists $keynote_frame] == 0 } {
      pack [labelframe $keynote_frame -text $row(APU_id)] \
        -fill x -expand true
    }
    if { $row(APU_expand) == "false" } {
      set apu_frame $keynote_frame.apu_[regsub -all {[.]} $row(APU_id) "_"]
      if { [winfo exists $apu_frame] == 0 } {
        pack [frame $apu_frame] -side left
        array set conf [list \
          from viewAPUSupplies \
          module viewAPUSupplies \
          idkey id \
          key APU_description \
          frame [frame $apu_frame.apu_description] \
          dollar false \
          currency false \
        ]
        pack $conf(frame) -side top -fill x -expand true
        labelentry::setup [array get conf] [array get row] [array get description]

        pack [frame $apu_frame.extras] -side top -fill x
        pack [label $apu_frame.extras.apu_unit_text -text "Unidad:"] -side left
        array set conf [list \
          from viewAPUSupplies \
          module viewAPUSupplies \
          idkey id \
          key APU_unit \
          frame [frame $apu_frame.extras.apu_unit] \
          dollar false \
          currency false \
        ]
        pack $conf(frame) -side left
        labelentry::setup [array get conf] [array get row] [array get description]

        pack [label $apu_frame.extras.apu_cost_text -text "Valor Unitario:"] \
          -side left
        array set conf [list \
          from viewAPUSupplies \
          module viewAPUSupplies \
          idkey id \
          key APU_cost \
          frame [frame $apu_frame.extras.apu_cost] \
          dollar true \
          currency true \
        ]
        pack $conf(frame) -side left
        labelentry::setup [array get conf] [array get row] [array get description]

        pack [label $apu_frame.extras.apu_qop_text -text "Rdto:"] \
          -side left
        array set conf [list \
          from viewAPUSupplies \
          module viewAPUSupplies \
          idkey id \
          key APU_qop \
          frame [frame $apu_frame.extras.apu_qop] \
          dollar false \
          currency false \
        ]
        pack $conf(frame) -side left
        labelentry::setup [array get conf] [array get row] [array get description]

        pack [label $apu_frame.extras.qtakeoff_qop_text -text "Cantidad:"] \
          -side left
        array set conf [list \
          from viewAPUSupplies \
          module viewAPUSupplies \
          idkey id \
          key Qtakeoff_qop \
          frame [frame $apu_frame.extras.qtakeoff_qop] \
          dollar false \
          currency false \
        ]
        pack $conf(frame) -side left
        labelentry::setup [array get conf] [array get row] [array get description]

        pack [label $apu_frame.extras.partial_text -text "Valor Parcial:"] \
          -side left
        pack [frame $apu_frame.extras.partial] -side left
        pack [label $apu_frame.extras.partial.label -text \
          "\$[format'currency [ \
            expr {([isnumeric $row(Qtakeoff_qop)] ? $row(Qtakeoff_qop) : 0) * \
              ([isnumeric $row(APU_cost)] ? $row(APU_cost) : 0)} \
          ]]"] -side right
        setup'newentry $apu_frame row
      }

      if { $row(APUSupplies_id) != "null" } {

        set action $apu_frame.supplies.action.$row(APUSupplies_id)
        if { [winfo exists $action] == 0 } {
          pack [frame $action]
          pack [label $action.delete -text "-" -width 1 -relief raised]
          bind $action.delete <ButtonPress-1> [list %W configure -relief sunken]
          bind $action.delete <ButtonRelease-1> [list \
            viewAPUSupplies::delete'row %W [array get row]]
        }

        input'type [array get row] $apu_frame.supplies
        input'description [array get row] $apu_frame.supplies

        array set conf [list \
          from viewAPUSupplies \
          module viewAPUSupplies \
          idkey id \
          key Supplies_unit \
          frame [frame $apu_frame.supplies.unit.$row(APUSupplies_id)] \
          dollar false \
          currency false \
        ]
        pack $conf(frame) -side top -fill x
        labelentry::setup [array get conf] [array get row] [array get description]

        array set conf [list \
          from viewAPUSupplies \
          module viewAPUSupplies \
          idkey id \
          key Supplies_cost \
          frame [frame $apu_frame.supplies.cost.$row(APUSupplies_id)] \
          dollar true \
          currency true \
        ]
        pack $conf(frame) -side top -fill x
        labelentry::setup [array get conf] [array get row] [array get description]

        array set conf [list \
          from viewAPUSupplies \
          module viewAPUSupplies \
          idkey id \
          key APUSupplies_qop \
          frame [frame $apu_frame.supplies.qop.$row(APUSupplies_id)] \
          dollar false \
          currency false \
        ]
        pack $conf(frame) -side top -fill x
        labelentry::setup [array get conf] [array get row] [array get description]

        set partialfr [frame $apu_frame.supplies.partial.$row(APUSupplies_id)]
        pack $partialfr -side top -fill x
        pack [label $partialfr.label -text \
          "\$[format'currency [ \
          expr { \
            ([isnumeric $row(APUSupplies_qop)] ? $row(APUSupplies_qop) : 0) * \
            ([isnumeric $row(Supplies_cost)] ? $row(Supplies_cost) : 0)} \
          ]]"] -side right
        setup'newentry $apu_frame row
      }
    }
  }

}
