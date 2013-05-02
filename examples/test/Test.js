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

var Animations = vs.core.createClass ({

  /** parent class */
  parent: vs.ui.Application,

  initComponent : function () {
    this._super ();

    this.dataflow = new DataFlow ();

    window.item1 = this.item1 = new vs.ui.TextLabel ({id: 'item1', text: '1'}).init ();
    this.add (this.item1);

    window.item2 = this.item2 = new vs.ui.TextLabel ({id: 'item2', text: '2'}).init ();
    this.add (this.item2);
  },

  applicationStarted : function (event) {
    this.item1.position = [0, 0];
    this.item2.position = [0, 0];

    this.item1.translation = [20, 20];
    this.item2.translation = [20, 120];

    this.testOrder1 ();
    this.testOrder2 ();
    this.testCycle ();
    this.testAPIAnimation ();
  },

  testOldAPI : function () {

    var item1 = this.item1;
    var item2 = this.item2;

    //OLD API
    var _df_id = this.id;
    vs._df_create (_df_id, 'id_0');
    vs._df_register_ref_node (_df_id, [item1.id, item2.id]);

    var edges = {};
    edges [item1.id] = [[item2.id, 1, [["position","position"]] ]];

    vs._df_register_ref_edges (_df_id, edges);
    vs._df_build (_df_id);


    _default_df_ = _df_node_to_def [_df_id];

    vs.scheduleAction (function () {
      item1.position = [50, 50];
        _default_df_.propagate ();
      });
  },

  testOldAPIAnimation : function () {

    var item1 = this.item1;
    var item2 = this.item2;

    var animOptions = {
      duration: 1000,
      pace: Pace.getEaseOutPace (),
      repeat: 10
    }

    var chrono = new Chronometer (animOptions).init ();
    var pace = Pace.getEaseOutPace ();
    var traj = new Vector2D ({values: [[0,0], [200, 50], [0, 0]]}).init ();

    //OLD API
    var _df_id = this.id;
    vs._df_create (_df_id, 'id_0');
    vs._df_register_ref_node (
      _df_id,
      [chrono.id, pace.id, traj.id, item1.id, item2.id]
    );

    var edges = {};
    edges [chrono.id] = [[pace.id, 1, [["tick","tickIn"]] ]];
    edges [pace.id] = [[traj.id, 1, [["tickOut","tick"]] ]];
    edges [traj.id] = [[item1.id, 1, [["out","position"]] ]];
    edges [item1.id] = [[item2.id, 1, [["position","position"]] ]];

    vs._df_register_ref_edges (_df_id, edges);
    vs._df_build (_df_id);


    _default_df_ = _df_node_to_def [_df_id];

    chrono.start ();
  },

  testOrder1 : function () {

    var TestObject = vs.core.createClass ({

      parent: vs.core.Object,

      properties : {
        "in": vs.core.Object.PROPERTY_IN,
        "out": vs.core.Object.PROPERTY_OUT
      }
    });


    var item1 = new TestObject ().init ();
    item1.propertiesDidChange = function () { console.log ('item1') }
    var item2 = new TestObject ().init ();
    item2.propertiesDidChange = function () { console.log ('item2') }
    var item3 = new TestObject ().init ();
    item3.propertiesDidChange = function () { console.log ('item3') }
    var item4 = new TestObject ().init ();
    item4.propertiesDidChange = function () { console.log ('item4') }
    var item5 = new TestObject ().init ();
    item5.propertiesDidChange = function () { console.log ('item5') }

    var df = new DataFlow ();
    _default_df_ = df;

    df.connect (item1, "out", item2, "in")
    df.connect (item2, "out", item3, "in")
    df.connect (item3, "out", item4, "in")
    df.connect (item4, "out", item5, "in")
    df.build ();

    item1['in'] = "huhu";
  },

  testOrder2 : function () {

    var TestObject = vs.core.createClass ({

      parent: vs.core.Object,

      properties : {
        "in": vs.core.Object.PROPERTY_IN,
        "out": vs.core.Object.PROPERTY_OUT
      }
    });


    var item1 = new TestObject ().init ();
    item1.propertiesDidChange = function () { console.log ('item1') }
    var item2 = new TestObject ().init ();
    item2.propertiesDidChange = function () { console.log ('item2') }
    var item3 = new TestObject ().init ();
    item3.propertiesDidChange = function () { console.log ('item3') }
    var item4 = new TestObject ().init ();
    item4.propertiesDidChange = function () { console.log ('item4') }
    var item5 = new TestObject ().init ();
    item5.propertiesDidChange = function () { console.log ('item5') }

    var df = new DataFlow ();
    _default_df_ = df;

    df.connect (item1, "out", item2, "in")
    df.connect (item4, "out", item5, "in")
    df.connect (item3, "out", item4, "in")
    df.connect (item2, "out", item3, "in")
    df.build ();

    item1['in'] = "huhu";
  },

  testCycle : function () {

    var TestObject = vs.core.createClass ({

      parent: vs.core.Object,

      properties : {
        "in": vs.core.Object.PROPERTY_IN,
        "out": vs.core.Object.PROPERTY_OUT
      }
    });


    var item1 = new TestObject ().init ();
    item1.propertiesDidChange = function () { console.log ('item1') }
    var item2 = new TestObject ().init ();
    item2.propertiesDidChange = function () { console.log ('item2') }
    var item3 = new TestObject ().init ();
    item3.propertiesDidChange = function () { console.log ('item3') }
    var item4 = new TestObject ().init ();
    item4.propertiesDidChange = function () { console.log ('item4') }
    var item5 = new TestObject ().init ();
    item5.propertiesDidChange = function () { console.log ('item5') }

    var df = new DataFlow ();
    _default_df_ = df;

    df.connect (item1, "out", item2, "in")
    df.connect (item2, "out", item3, "in")
    df.connect (item3, "out", item4, "in")
    df.connect (item3, "out", item1, "in")
    df.connect (item4, "out", item5, "in")
    df.build ();

    item1['in'] = "huhu";
  },

  testAPIAnimation : function () {

    var item1 = this.item1;
    var item2 = this.item2;

    var animOptions = {
      duration: 1000,
      pace: Pace.getEaseOutPace (),
      // steps: 10,
      repeat: 10
    }

    var chrono = new Chronometer (animOptions).init ();
    var pace = Pace.getEaseOutPace ();
    var traj = new Vector2D ({values: [[0,0], [200, 50], [0, 0]]}).init ();

    var df = new DataFlow ();
    _default_df_ = df;

    df.connect (chrono, "tick", pace, "tickIn")
    df.connect (traj, "out", item1, "position")
    df.connect (item1, "position", item2, "position")
    df.connect (pace, "tickOut", traj, "tick")
    df.build ();

    chrono.start ();
  },
});

function loadApplication () {
  new Animations ({id:"animations", layout:vs.ui.View.ABSOLUTE_LAYOUT}).init ();

  vs.ui.Application.start ();
}


function test () {
  var desc_in = item1.getPropertyDescriptor ('text');
  var desc_out = item2.getPropertyDescriptor ('text');

  if (!desc_in || !desc_in.get) { return; }
  if (!desc_out || !desc_out.set) { return; }

  var nb = 1000000;
  var t = Date.now ();
  for (var i = 0; i < nb; i++)
  {
    desc_out.set.call (item2, desc_in.get.call (item1));
  }
  console.log ('t1: ' + (Date.now () - t));

  t = Date.now ();
  for (i = 0; i < nb; i++)
  {
    item2.text = item1.text;
  }
  console.log ('t2: ' + (Date.now () - t));

  t = Date.now ();
  for (i = 0; i < nb; i++)
  {
    item2 ['text'] = item1 ['text'];
  }
  console.log ('t3: ' + (Date.now () - t));
}
