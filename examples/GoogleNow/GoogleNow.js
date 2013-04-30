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

var iconsTemplate =
"<div class='shortcuts vs_ui_view'> \
  <div> \
    <img src='assets/News.png'></img> \
    <span>Apps</span> \
  </div> \
  <div> \
    <img src='assets/Websearch.png'></img> \
    <span>Voice</span> \
  </div> \
  <div> \
    <img src='assets/Images.png'></img> \
    <span>Goggles</span> \
  </div> \
</div>"

var _default_df_;

// add opacity property to View
util.defineClassProperties (vs.ui.View, {

  'opacity': {
    set : function (v) {
      this.view.style.opacity = v;
      _opacity = v;
    }
  }
});

var Animations = vs.core.createClass ({

  /** parent class */
  parent: vs.ui.Application,

  initComponent : function () {
    this._super ();

    this.dataflow = new DataFlow ();
    _default_df_ = this.dataflow;
    
    this.slider = new vs.ui.Slider ({
      orientation: vs.ui.Slider.VERTICAL,
      range: [0, 1],
      position: [350, 40],
      size: [10, 300]
    }).init ();
    this.add (this.slider);
    
    this.buildGoogleNowView ();
    this.buildGoogleSearchView ();
    this.configDataflow ();
  },
  
  buildGoogleNowView : function () {
      
    this.backImage = new vs.ui.ImageView ({
      src : "assets/header-bg.jpg",
      position: [0,0],
      size: [320, 200]
    }).init ();
    
    this.add (this.backImage);

    this.logoImageWhite = new vs.ui.ImageView ({
      src : "assets/google_logo_white.png",
      position: [70, 40],
      size: [180, 60]
    }).init ();
    
    this.add (this.logoImageWhite);
  },

  buildGoogleSearchView : function () {

    this.logoImageColor = new vs.ui.ImageView ({
      src : "assets/Google_logo_color.png",
      position: [70, 40],
      size: [180, 60],
    }).init ();
    
    this.add (this.logoImageColor);

    this.searchInput = new vs.ui.InputField ({
      position: [20, 120],
      size: [280, 40],
    }).init ();
    
    this.add (this.searchInput);
    
    this.shortCuts = new vs.ui.View ({
      position: [10, 340],
      template: iconsTemplate,
      layout: vs.ui.View.HORIZONTAL_LAYOUT
    }).init ();
    
    this.add (this.shortCuts);
  },

  configDataflow: function () {
  
    //  Animate Google Color log
    var trajPos = new Vector2D ({values: [[0,0], [0, 90]]}).init ();
    var trajScale = new Vector1D ({values: [1, 1.3]}).init ();
    var trajOpacity = new Vector1D ({values: [0, 1]}).init ();

    this.dataflow.connect (this.slider, "value", trajPos, "tick");
    this.dataflow.connect (this.slider, "value", trajScale, "tick");
    this.dataflow.connect (this.slider, "value", trajOpacity, "tick");
    this.dataflow.connect (trajPos, "out", this.logoImageColor, "translation");
    this.dataflow.connect (trajScale, "out", this.logoImageColor, "scaling");
    this.dataflow.connect (trajOpacity, "out", this.logoImageColor, "opacity");    
    
    //  Animate Google White logo
    var trajOpacityTer = new Vector1D ({values: [1, 0]}).init ();
    this.dataflow.connect (this.slider, "value", trajOpacityTer, "tick");
    this.dataflow.connect (trajPos, "out", this.logoImageWhite, "translation");
    this.dataflow.connect (trajScale, "out", this.logoImageWhite, "scaling");
    this.dataflow.connect (trajOpacityTer, "out", this.logoImageWhite, "opacity");    

    //  Animate search field
    var trajPosBis = new Vector2D ({values: [[0,0], [0, 90]]}).init ();
    this.dataflow.connect (this.slider, "value", trajPosBis, "tick");
    this.dataflow.connect (trajPosBis, "out", this.searchInput, "translation");

    //  Animate short cuts
    var trajOpacityBis = new Vector1D ({values: [0, 1]}).init ();
    this.dataflow.connect (this.slider, "value", trajOpacityBis, "tick");
    this.dataflow.connect (trajOpacityBis, "out", this.shortCuts, "opacity");
   
    //  Animate background image
    this.dataflow.connect (trajOpacityTer, "out", this.backImage, "opacity");

    // Compile the dataflow
    this.dataflow.build ();
    
    // first burst (but should be automatic)
    this.slider.propagateChange ();
  },
  
  applicationStarted : function (event) { }
});

function loadApplication () {
  new Animations ({id:"animations", layout:vs.ui.View.ABSOLUTE_LAYOUT}).init ();

  vs.ui.Application.start ();
}