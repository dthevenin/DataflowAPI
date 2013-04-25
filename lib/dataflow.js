/**
  Copyright (C) 2009-2012. David Thevenin, ViniSketch SARL (c), and 
  contributors. All rights reserved
  
  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU Lesser General Public License as published
  by the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.
  
  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
  GNU Lesser General Public License for more details.
  
  You should have received a copy of the GNU Lesser General Public License
  along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

function DataFlow ()
{
  // ordered node list Array<Object>
  this.dataflow_node = [];
  
  // edges from components Object[component.id] => Array[3] <Object, , properties>
  this.dataflow_edges = {};
  this.is_propagating = false;
  this._node_link = {};
  this.__shouldnt_propagate__ = 0;
}

DataFlow.prototype = {

  propagate_values : function (obj)
  {
    var edges = this.dataflow_edges [obj._id], k, j, obj,
      fnc_in, fnc_out,
      edge, obj_next, connectors, connector, l, ll;
    if (!edges) { return; }
    
    l = edges.length;
    for (k = 0; k < l; k++) {
      edge = edges [k];
      obj_next = edge[0];
      
      connectors = edge[2];
      if (connectors) {
        ll = connectors.length;
        // properties value propagation
        for (j = 0; j < ll; j++) {
          connector = connectors [j];
          fnc_in = connector [0];
          fnc_out = connector [1];
          fnc_out.call (obj_next, fnc_in.call (obj));
        }
        
        obj_next.__should__call__has__changed__ = true;
      }
    }
  },
  
  propagate : function (obj)
  {
    if (this.is_propagating || this.__shouldnt_propagate__) { return; }
    
    this.is_propagating = true;
    
    var i = 0, l = this.dataflow_node.length;
    if (obj) {
      // find the first node corresponding to the id
      while (i < l && this.dataflow_node [i] !== obj) { i++; }
    
      // the node wad found. First data propagation
      if (i < l - 1) {
        this.propagate_values (obj);
        i++;
      }
    }
    
    // continue the propagation
    for (; i < l; i++)
    {
      obj = this.dataflow_node [i];
      if (!obj) { continue; }
  
      if (obj.__should__call__has__changed__ && obj.propertiesDidChange) {
        obj.propertiesDidChange ();
        obj.__should__call__has__changed__ = false;
      }
      
      this.propagate_values (obj);
    }
    
    // end of propagation
    this.is_propagating = false;
  },
  
  /**
   * @private
   */
  pausePropagation : function ()
  {
    this.__shouldnt_propagate__ ++;
  },
  
  /**
   * @private
   */
  restartPropagation : function ()
  {
    this.__shouldnt_propagate__ --;
    if (this.__shouldnt_propagate__ < 0) this.__shouldnt_propagate__ = 0;
  },

  register_ref_node : function (data)
  {
    if (!data) { return; }
    this._ref_node = data;
  },
  
  register_ref_edges : function (data)
  {
    if (!data) { return; }
    this._ref_edges = data;
  }
};

/********************************************************************
                      Export
*********************************************************************/
vs.core.DataFlow = DataFlow;

/**
 *  Performs a topological sort on this DAG, so that getNodes returns the
 *  ordered list of nodes.<p>
 *  Returns true if the graph is acyclic, false otherwise. When the graph is
 *  cyclic, the algorithm does at it best to partially order it and issues a
 *  warning.
 *
 *  @return {boolean}
 */
DataFlow.prototype.sort = function ()
{
  /// This method uses the classical sorting algorithm with cycle-detection.
  /// See, e.g., http://www.cs.umb.edu/cs310/class23.html
  /// It is normally O(|E|) but this probably won't be the case here
  /// until efficiency issues have been solved.
  /// The algorithm has also been modified in order to cyclic graphs to be
  /// partially sorted instead of being not sorted at all.

  /// 1) Calculate in-degrees for nodes
  var nb_node = this._list_node.length;
  var indegrees = [];

  for (var i = 0; i < nb_node; i++)
  {
    indegrees [i] = 0;
  }

  for (var key in this._edgesFrom)
  {
    /// FIXME: For more efficiency, store indexes into edges to avoid node
    /// search.
    var ids = this._edgesFrom [key]
    for (var j = 0; j < ids.length; j++)
    {
      //find the index of the node in the node list
      var index = this._list_node.findItem (ids [j][0])
      indegrees [index]++;
    }
  }

  /// 2) Initialization
  var pending = this._list_node.slice ();
  var sorted = [];
  var violationcount = 0;

  /// 3) Loop until everything has been sorted
  while (pending.length != 0)
  {
    /// Extract a node of minimal input degree and append it to list topsorted
    var min_i = this._array_min (indegrees);
    var indegree = indegrees [min_i];
    indegrees.remove (min_i);

    var n_id = pending [min_i];
    pending.remove (min_i);
    if (indegree > 0)
    {
      violationcount++;
    }
    sorted.push (n_id);

    /// 4) Decrement indegrees of nodes m adjacent to n
    /// FIXME: For more efficiency, store adjacent nodes to avoid this search.
    /// Use an adjacency matrix implementation ?
    var ids = this._edgesFrom [n_id];
    if (ids)
    {
      for (var j = 0; j < ids.length; j++)
      {
        var mi =  pending.findItem (ids [j][0]);
        if (mi != -1) indegrees [mi]--;
      }
    }
  }

  delete (pending);

  /// 5) Update node list & return result
  this._list_node = sorted;
  this.is_sorted = true;
  this.is_cyclic = violationcount > 0;

  if (violationcount > 0)
  {
    var edgecount = this._size (this._edgesFrom);
    console.log (
      "WARNING: Cycles detected during topological sort."
      + violationcount + " dependencies out of " + edgecount
      + " have been violated.\n");
  }
  return !this.is_cyclic;
};
var VSObject = vs.core.Object;

DataFlow.prototype.build = function ()
{
  if (!this._ref_node || !this._ref_edges) { return; }
  
  var temp = [], i, ref, edges, edges_temp, edge, edge_temp,
    cid_src, cid_trg, obj_src, obj_trg;
  for (i = 0; i < this._ref_node.length; i++)
  {
    ref = this._ref_node [i];
    cid_src = this._node_link [ref];
    if (!cid_src) { cid_src = ref; }
    
    obj_src = VSObject._obs [cid_src]; if (!obj_src) { continue; }
    
    temp.push (obj_src);
  }
  this.dataflow_node = temp;
  
  temp = {};
  for (ref in this._ref_edges)
  {
    cid_src = this._node_link [ref];
    if (!cid_src) { cid_src = ref; }
   
    obj_src = VSObject._obs [cid_src]; if (!obj_src) { continue; }

    edges = this._ref_edges [ref];
    edges_temp = [];
    for (i = 0; i < edges.length; i++) {
      edge = edges [i];
      edge_temp = [3];
      
      cid_trg = this._node_link [edge [0]];
      if (!cid_trg) { cid_trg = edge [0]; }
      obj_trg = VSObject._obs [cid_trg];  if (!obj_trg) { continue; }
      
      edge_temp [0] = obj_trg;
      edge_temp [1] = edge [1];
      
      var properties = [];
      var connectors = edge [2];
      for (j = 0; j < connectors.length; j++)
      {
        var prop_in = connectors [j][0];
        var prop_out = connectors [j][1]; 
                
        var desc_out = obj_trg.getPropertyDescriptor (prop_out);
        var desc_in = obj_src.getPropertyDescriptor (prop_in);

        if (!desc_in || !desc_in.get) { continue; }
        if (!desc_out || !desc_out.set) { continue; }
        
        properties.push ([desc_in.get, desc_out.set]);
      }
      edge_temp [2] = properties;
      
      edges_temp.push (edge_temp);
    }
    
    temp [cid_src] = edges_temp;
  }
  this.dataflow_edges = temp;
};

var _df_node_to_def = {};

function _df_create (id, ref)
{
  var df = new DataFlow ();
  
  df.ref = ref;
  _df_node_to_def [id] = df;
  
  return df;
}
vs._df_create = _df_create;


function _df_node_register (df_id, ref, id)
{
  if (!df_id || !ref || !id) { return; }
  var df = _df_node_to_def [df_id];
  if (!df) { return; }
  
  df._node_link [ref] = id;
  _df_node_to_def [id] = df;
}
vs._df_node_register = _df_node_register;


function _df_register_ref_node (id, data)
{
  if (!id || !data) { return; }
  
  var df = _df_node_to_def [id];
  if (!df) { return; }
  
  df.register_ref_node (data);
}
vs._df_register_ref_node = _df_register_ref_node;

function _df_register_ref_edges (id, data)
{
  if (!id || !data) {return;}
  
  var df = _df_node_to_def [id];
  if (!df) { return; }
  
  df.register_ref_edges (data);
}
vs._df_register_ref_edges = _df_register_ref_edges;

function _df_build (id)
{
  if (!id) { return; }
  
  var df = _df_node_to_def [id];
  if (!df) {return;}
  
  df.build ();
}
vs._df_build = _df_build;



/**
 *  Object configuation method. <p>
 *  Call this method to adjust some properties of the internal components
 *  using one call. <br/>
 *  It takes as parameters, an associated array <propertyName, value>.
 *  <br/><br/>
 *  Ex:
 *  @example
 *  var myObject = new vs.core.Object ({id: 'myobject'});
 *  myObject.init ();
 *
 *  myObject.configure ({prop1: "1", prop2: 'hello', ..});
 *  <=>
 *  myObject.prop1 = "1";
 *  myObject.prop2 = "hello";
 *  ...
 *
 * @name vs.core.Object#configure
 * @function
 *
 * @param {Object} config the associated array used for configuring the
 *        object.
 */
vs.core.Object.prototype.configure = function (config) {
  if (typeof (config) !== 'object') { return; }
  var props, key, i, should_propagate = false, desc;

//  var df = _df_node_to_def [this._id];
  if (_default_df_) _default_df_.pausePropagation ();

  // Manage model
  if (config instanceof vs.core.Model) {
    desc = this.getPropertyDescriptor ('model');
    if (desc && desc.set) {
      // model property assignation
      this.model = config;
      should_propagate = true;
    }
    else {
      // one by one property copy
      props = config.getModelProperties ();
      for (i = 0; i < props.length; i++) {
        key = props [i];
        if (key === 'id') { continue; }
        this [key] = config [key];
        should_propagate = true;
      }
    }
  }
  else
  {
    if (config) for (key in config) {
      if (key === 'id' || key === 'node' ||
          key === 'node_ref' || key === 'view') { continue; }
      this [key] = config [key];
      should_propagate = true;
    }
  }

  if (_default_df_) {
    _default_df_.restartPropagation ();
    if (should_propagate) {
      if (this.propertiesDidChange) this.propertiesDidChange ();
      _default_df_.propagate (this); // <<<< MEW API
    }
  }
  else if (should_propagate && this.propertiesDidChange) {
    this.propertiesDidChange ();
  }
};

/**
 * Manually force properties change propagation.
 * <br/>
 * If no property name is specified, the system will assume all component's
 * properties have been modified.
 *
 * @name vs.core.Object#propertyChange
 * @function
 *
 * @param {String} property the name of the modified property.[optional]
 */
function propertyChange (property) {
//  var df = _df_node_to_def [this._id];
  if (_default_df_) { _default_df_.propagate (this, property); } // <<<< MEW API
};

vs.core.Object.prototype.propertyChange = propertyChange;
Chronometer.prototype.propertyChange = propertyChange;

/**
 * Manually force dataflow properties change propagation.
 * <br/>
 * If no property name is specified, the system will assume all component's
 * properties have been modified.
 *
 * @name vs.core.Model#propertyChange
 * @function
 *
 * @param {String} property the name of the modified property.[optional]
 */
vs.core.Model.prototype.propertyChange = function (property) {
//  var df = _df_node_to_def [this._id];
  if (_default_df_) { _default_df_.propagate (this, property); }

  if (this.__should_propagate_changes__) {
    var l = this.__links__.length, obj;
    if (property) while (l--)
    { this.__links__ [l] [property] = this [property]; }
    else while (l--) { this.__links__ [l].configure (this); }

    this.change (null, null, true);
  }
};

var util = vs.util;

var proto = vs.ui.View.prototype;

