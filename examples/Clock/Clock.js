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

var Clock = vs.core.createClass ({

  /** parent class */
  parent: vs.ui.Application,

  initComponent : function () {
    this._super ();

    var dataflow = vs._default_df_;
    
    var clockView = new MyClock ().init ()
    this.add (clockView)
  
    var chronoMinute = new Chronometer ({
      duration: 1000,
      pace: Pace.getEaseOutPace (),
      repeat: 10
     }).init ();
    var trajMinute = new Vector1D ({values: [0, 59]}).init ();


    var chronoHour = new Chronometer ({
      duration: 10000,
      pace: Pace.getEaseOutPace ()
    }).init ();
    var trajHour = new Vector1D ({values: [0, 23]}).init ();
    
    chronoMinute
      .connect ("tick").to (trajMinute, "tick");
    trajMinute
     .connect ("out").to (clockView, "minute");

    chronoHour
      .connect ("tick").to (trajHour, "tick");
    trajHour
      .connect ("out").to (clockView, "hour")

    this.clockChrono = vs.par (chronoMinute, chronoHour);
  },

  applicationStarted : function (event) {    
    this.clockChrono.start ();
  }
});

function loadApplication () {
  new Clock ({id:"animations", layout:vs.ui.View.ABSOLUTE_LAYOUT}).init ();

  vs.ui.Application.start ();
    
  // Compile the dataflow
  vs._default_df_.build ();
}
