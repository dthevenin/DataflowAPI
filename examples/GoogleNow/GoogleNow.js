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

// add opacity property to View
vs.util.defineClassProperties (vs.ui.View, {

  'opacity': {
    set : function (v) {
      if (this.view) this.view.style.opacity = v;
      _opacity = v;
    }
  }
});

var Animations = vs.core.createClass ({

  /** parent class */
  parent: vs.ui.Application,

  initComponent : function () {
    this._super ();

    this.googleView = new vs.ui.View ({
      id:'googleView',
      layout: vs.ui.View.ABSOLUTE_LAYOUT,
      magnet: vs.ui.View.MAGNET_CENTER
    }).init ();
    this.add (this.googleView);
    
    this.slider = new vs.ui.Slider ({
      orientation: vs.ui.Slider.VERTICAL,
      range: [0, 1],
      position: [350, 40],
      size: [10, 300]
    }).init ();
    this.googleView.add (this.slider);
    
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
    
    this.googleView.add (this.backImage);

    this.logoImageWhite = new vs.ui.ImageView ({
      src : "assets/google_logo_white.png",
      position: [70, 40],
      size: [180, 60]
    }).init ();
    
    this.googleView.add (this.logoImageWhite);
  },

  buildGoogleSearchView : function () {

    this.logoImageColor = new vs.ui.ImageView ({
      src : "assets/google_logo_color.png",
      position: [70, 40],
      size: [180, 60],
    }).init ();
    
    this.googleView.add (this.logoImageColor);

    this.searchInput = new vs.ui.InputField ({
      position: [20, 120],
      size: [280, 40],
    }).init ();
    
    this.googleView.add (this.searchInput);
    
    this.shortCuts = new vs.ui.View ({
      position: [10, 340],
      template: iconsTemplate,
      layout: vs.ui.View.HORIZONTAL_LAYOUT
    }).init ();
    
    this.googleView.add (this.shortCuts);
  },

  configDataflow: function () {
  
    // Animate Google Color log
    var trajPos = new Vector2D ({values: [[0,0], [0, 90]]}).init ();
    var trajScale = new Vector1D ({values: [1, 1.3]}).init ();
    var trajOpacity = new Vector1D ({values: [0, 1]}).init ();

    // Animate Google White logo
    var trajOpacityTer = new Vector1D ({values: [1, 0]}).init ();

    // Animate search field
    var trajPosBis = new Vector2D ({values: [[0,0], [0, 90]]}).init ();

    // Animate short cuts
    var trajOpacityBis = new Vector1D ({values: [0, 1]}).init ();

    this.slider
      .connect ("value")
      .to (trajPos, "tick")
      .to (trajScale, "tick")
      .to (trajOpacity, "tick")
      .to (trajOpacityTer, "tick")
      .to (trajPosBis, "tick")
      .to (trajOpacityBis, "tick");
      
    trajPos.connect ("out").to (this.logoImageColor, "translation");
    trajScale.connect ("out").to (this.logoImageColor, "scaling");
    trajOpacity.connect ("out").to (this.logoImageColor, "opacity");    
    
    trajPos.connect ("out").to (this.logoImageWhite, "translation");
    trajScale.connect ("out").to (this.logoImageWhite, "scaling");
    trajOpacityTer.connect ("out")
      .to (this.logoImageWhite, "opacity")
      // Animate background image
      .to (this.backImage, "opacity");

    trajPosBis.connect ("out").to (this.searchInput, "translation");

    trajOpacityBis.connect ("out").to (this.shortCuts, "opacity");
   
    // first burst (but should be automatic)
    var self = this;
    vs.scheduleAction (function () { self.slider.propagateChange (); });
  },
  
  applicationStarted : function (event) { }
});

function loadApplication () {
  new Animations ({id:"animations", layout:vs.ui.View.ABSOLUTE_LAYOUT}).init ();

  vs.ui.Application.start ();
    
  // Compile the dataflow
  vs._default_df_.build ();
}