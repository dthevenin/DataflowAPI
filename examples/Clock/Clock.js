/**
 * Copyright (C) 2009-2013. David Thevenin, ViniSketch (c), and
 * contributors. All rights reserved
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

var _default_df_;

var Clock = vs.core.createClass ({

  /** parent class */
  parent: vs.ui.Application,

  initComponent : function () {
    this._super ();

    var dataflow = new DataFlow ();
    _default_df_ = dataflow;
    
    var clockView = new MyClock ().init ()
    this.add (clockView)
  
    var chronoMinute = new Chronometer ({
      duration: 1000,
      pace: Pace.getEaseOutPace (),
      repeat: 10
     }).init ();
    var trajMinute = new Vector1D ({values: [0, 59]}).init ();

    dataflow.connect (chronoMinute, "tick", trajMinute, "tick");
    dataflow.connect (trajMinute, "out", clockView, "minute");

    var chronoHour = new Chronometer ({
      duration: 10000,
      pace: Pace.getEaseOutPace ()
    }).init ();
    var trajHour = new Vector1D ({values: [0, 23]}).init ();

    dataflow.connect (chronoHour, "tick", trajHour, "tick");
    dataflow.connect (trajHour, "out", clockView, "hour");

    // Compile the dataflow
    dataflow.build ();
    
    this.clockChrono = vs.par (chronoMinute, chronoHour);
  },

  applicationStarted : function (event) {    
    this.clockChrono.start ();
  }
});

function loadApplication () {
  new Clock ({id:"animations", layout:vs.ui.View.ABSOLUTE_LAYOUT}).init ();

  vs.ui.Application.start ();
}
