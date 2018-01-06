package require BWidget
source [file join [file dirname [info script]] "m3co/main.tcl"]

#
# MAIN - es para conectarse, definir chan y delegar los eventos
#
# Variables
#  chan - channel o canal de conexion TCP
#
#  leftPanel - el frame izquierdo
#  centerPanel - el frame del centro
#
namespace eval MAIN {
  connect [namespace current]
  wm title . "La tienda -"
  wm geometry . "800x600+100+10"

  set leftPanel [frame .leftpanel]
  set centerPanel [frame .centerpanel]
  pack $leftPanel -fill y -side left
  pack $centerPanel -fill both -side left -expand true

  set scrolledwindow [ScrolledWindow $leftPanel.scrolledWindow \
    -ipad 0 -bd 0 -bg blue]

  pack $scrolledwindow -fill both -expand true

  proc subscribe { } {
    variable chan
    set event [dict create \
      module [json::write string Keynotes] \
      query [json::write string subscribe] \
    ]
    chan puts $chan [json::write object {*}$event]
  }
  subscribe
}

proc MAIN::setupLayout { } {
  variable scrolledwindow
  $scrolledwindow setwidget $Keynotes::tree
  update                ;# Process all UI events before moving on.
}

source [file join [file dirname [info script]] keynotes.tcl]
Keynotes::create $MAIN::scrolledwindow
MAIN::setupLayout
Keynotes::setupBinds APU::open Keynotes::begin'edit \
  [list Keynotes::open'popupmenu %X %Y]
