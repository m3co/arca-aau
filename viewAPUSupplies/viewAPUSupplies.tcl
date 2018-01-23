
namespace eval Supplies {
  proc 'do'search { resp } {
    upvar $resp response
    viewAPUSupplies::'do'search response
  }
}

namespace eval viewAPUSupplies {
  variable frame
  variable description

  chan puts $MAIN::chan [json::write object \
    query [json::write string describe] \
    module [json::write string viewAPUSupplies] \
  ]

  proc 'do'describe { resp } {
    upvar $resp response
    variable description
    array set description [list {*}$response(description)]
  }

  proc open'view { space keynote } {
    set id [regsub -all {[.]} $keynote "_"]

    if { [winfo exists $space] == 1 } {
      destroy $space
    }
    pack [ScrolledWindow $space] -side right -fill both -expand true
    set centerFrame [ScrollableFrame [$space getframe].centerframe]
    $space setwidget $centerFrame

    variable frame [$centerFrame getframe].$id
    pack [frame $frame] -fill x -expand true

    set event [list \
      query {"select"} \
      module {"viewAPUSupplies"} \
      from {"viewAPUSupplies"} \
      keynote [json::write string $keynote] \
    ]

    chan puts $MAIN::chan [json::write object {*}$event]
  }

  proc delete'row { path r } {
    array set row [deserialize $r]
    set event [dict create \
      query [json::write string delete] \
      module [json::write string APUSupplies] \
      id $row(APUSupplies_id) \
      idkey [json::write string id] \
    ]
    chan puts $MAIN::chan [json::write object {*}$event]
    $path configure -relief raised
  }

  proc 'do'insert { resp } {
    upvar $resp response
    'do'select response
  }

  proc 'do'delete { resp } {
    upvar $resp response
    array set row [deserialize $response(row)]
    variable frame

    set keynote_frame $frame.[regsub -all {[.]} $row(APU_id) "_"]
    set apu_frame $keynote_frame.apu_[regsub -all {[.]} $row(APU_id) "_"]

    if { $row(APUSupplies_id) != "null" } {
      if { [winfo exists $apu_frame.supplies.type.$row(APUSupplies_id)] == 1 } {
        destroy $apu_frame.supplies.type.$row(APUSupplies_id)
      }
      if { [winfo exists $apu_frame.supplies.description.$row(APUSupplies_id)] == 1 } {
        destroy $apu_frame.supplies.description.$row(APUSupplies_id)
      }
      if { [winfo exists $apu_frame.supplies.unit.$row(APUSupplies_id)] == 1 } {
        destroy $apu_frame.supplies.unit.$row(APUSupplies_id)
      }
      if { [winfo exists $apu_frame.supplies.cost.$row(APUSupplies_id)] == 1 } {
        destroy $apu_frame.supplies.cost.$row(APUSupplies_id)
      }
      if { [winfo exists $apu_frame.supplies.qop.$row(APUSupplies_id)] == 1 } {
        destroy $apu_frame.supplies.qop.$row(APUSupplies_id)
      }
      if { [winfo exists $apu_frame.supplies.action.$row(APUSupplies_id)] == 1 } {
        destroy $apu_frame.supplies.action.$row(APUSupplies_id)
      }
      if { [winfo exists $apu_frame.supplies.partial.$row(APUSupplies_id)] == 1 } {
        destroy $apu_frame.supplies.partial.$row(APUSupplies_id)
      }
      return
    }

    if { $row(APU_id) != "null" } {
      if { [winfo exists $apu_frame] == 1 } {
        destroy $apu_frame
      }
    }
    if { [winfo exists $keynote_frame] == 1 } {
      destroy $keynote_frame
    }
  }
}

source [file join [file dirname [info script]] doupdate.tcl]
source [file join [file dirname [info script]] doselect.tcl]
source [file join [file dirname [info script]] inputdescription.tcl]
source [file join [file dirname [info script]] inputtype.tcl]
source [file join [file dirname [info script]] supplies.tcl]
