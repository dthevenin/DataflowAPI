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

var MyClock = vs.core.createClass ({

  /** parent class */
  parent: vs.ui.View,
  
  template:
  "<div id='slice' class='pie_progress'> \
    <div class='minute'> \
      <div class='pie'></div> \
      <div class='pie fill'></div> \
    </div> \
    <div class='hour'> \
      <div class='pie'></div> \
      <div class='pie fill'></div> \
    </div> \
    <div class='info'>${info}</div> \
  </div>",

  properties : {
    'minute' : {
      set : function (v) {
        if (!vs.util.isNumber (v)) return;
        if (v < 0) v = 0;
        else if (v > 59) v = 59;
        this._minute = v ;
        if (v < 29.5) {
          vs.util.setElementVisibility (this.__slice_min2,  false);
          vs.util.addClassName (this.__clip_min, 'clip');
        }
        else {
          vs.util.setElementVisibility (this.__slice_min2,  true);
          vs.util.removeClassName (this.__clip_min, 'clip');
        }
        var deg = (v / 59) * 360 - 45;
        var transform = "rotate(" + deg + "deg)";
        vs.util.setElementTransform (this.__slice_min1, transform);
        
        this.info = parseInt (this._hour, 10) + ':' + parseInt (this._minute, 10);
      }
    },

    'hour' : {
      set : function (v) {
        if (!vs.util.isNumber (v)) return;
        if (v < 0) v = 0;
        else if (v > 23) v = 23;
        this._hour = v ;
        if (v < 11.5) {
          vs.util.setElementVisibility (this.__slice_hour2,  false);
          vs.util.addClassName (this.__clip_hour, 'clip');
        }
        else {
          vs.util.setElementVisibility (this.__slice_hour2,  true);
          vs.util.removeClassName (this.__clip_hour, 'clip');
        }
        
        var deg = (v / 23) * 360 - 45;
        var transform = "rotate(" + deg + "deg)";
        vs.util.setElementTransform (this.__slice_hour1, transform);
        
       this.info = parseInt (this._hour, 10) + ':' + parseInt (this._minute, 10);
      }
    }
  },
  
  _minute : 0,
  _hour : 0,
  
  initComponent : function ()
  {
    this._super ();
    
    this.__clip_min = this.view.querySelector (".pie_progress > .minute");
    this.__clip_hour = this.view.querySelector (".pie_progress > .hour");
    this.__slice_min1 = this.view.querySelector (".minute .pie");
    this.__slice_min2 = this.view.querySelector (".minute .pie.fill");
    this.__slice_hour1 = this.view.querySelector (".hour .pie");
    this.__slice_hour2 = this.view.querySelector (".hour .pie.fill");
  }
});