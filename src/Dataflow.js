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

var util = vs.util;

function DataFlow ()
{
  // ordered node list Array<Object>
  this.dataflow_node = [];

  // edges from components Object[component.id] => Array[3] <Object, , properties>
  this.dataflow_edges = {};
  this.is_propagating = false;
  this._node_link = {};
  this.__shouldnt_propagate__ = 0;
  
  this._list_node = []
  this._edges_from = {};
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
      edge = edges [k]; if (!edge) { continue; }
      obj_next = edge[0]; if (!obj_next) { continue; }

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
   *  Performs a topological sort on this DAG, so that getNodes returns the
   *  ordered list of nodes.<p>
   *  Returns true if the graph is acyclic, false otherwise. When the graph is
   *  cyclic, the algorithm does at it best to partially order it and issues a
   *  warning.
   *
   *  @private
   *  @return {boolean}
   */
  _sort : function ()
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

    for (var key in this._edges_from)
    {
      /// FIXME: For more efficiency, store indexes into edges to avoid node
      /// search.
      var ids = this._edges_from [key]
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
      var ids = this._edges_from [n_id];
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
      var edgecount = Object.keys (this._edges_from).length;
      console.warn (
        "WARNING: Cycles detected during topological sort."
        + violationcount + " dependencies out of " + edgecount
        + " have been violated.\n");
    }
    return !this.is_cyclic;
  },
  
  /**
   * Returns the index of the smallest element into an array
   *
   * @private
   * @param {Array} indegrees the Array
   * @return {integer} the index
   */
  _array_min : function (indegrees) {
    var count = indegrees.length;
    if (count === 0) return -1;
    if (count === 1) return 0;
    var min_index = 0;
    var min = indegrees [min_index];

    for (var i = 1; i < indegrees.length; i++) {
      if (indegrees [i] < min) {
        min = indegrees [i];
        min_index = i;
      }
    }
    return min_index;
  },

  build : function () {
    this._sort ();
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

  /**
   *  xxx
   *
   *  @private
   */
  connect : function (obj_src, property_out, obj_trg, property_in) {
    var cid_src, cid_trg, properties_out, properties_in, data, index;
  
    if (util.isString (obj_src)) cid_src = obj_src;
    else cid_src = obj_src._id;
  
    if (util.isString (obj_trg)) cid_trg = obj_trg;
    else cid_trg = obj_trg._id;
    
    // Properties out management
    if (util.isString (property_out)) {
      properties_out = [property_out];
    }
    else if (!util.isArray (property_out)) {
      console.warn ("DataFlow.connect, error");
      return;
    }
    else properties_out = property_out;
  
    // Properties in management
    if (util.isString (property_in)) {
      properties_in = [property_in];
    }
    else if (!util.isArray (property_in)) {
      console.warn ("DataFlow.connect, error");
      return;
    }
    else properties_in = property_in;
    
    if (properties_in.length !== properties_out.length) {
      console.warn ("DataFlow.connect, error");
      return;
    }
    
    if (this._list_node.indexOf (cid_src) === -1)
      this._list_node.push (cid_src);

    if (this._list_node.indexOf (cid_trg) === -1)
      this._list_node.push (cid_trg);

    data = this._edges_from [cid_src];
    if (!data) {
      data = [];
      this._edges_from [cid_src] = data;
    }
    
    var
      properties_l = properties_in.length,
      data_l = data.length,
      connectors, properties;
      
    // find a existing connection to the component
    for (index = 0; index < data_l; index++) {
      connectors = data [index];
      if (connectors[0] === cid_trg) {
        properties = connectors [2];
        break;
      }
    }
    // no connection exist, create
    if (!properties) {
      properties = [];
      data.push ([cid_trg, 1, properties]);
    }
    
    // Add properties
    // @TODO @WARNING Should test if properties does not already exists
    for (index = 0; index < properties_l; index++) {
      properties.push ([properties_out[index], properties_in[index]]);
    }
  }
};

/********************************************************************
                      Export
*********************************************************************/
vs.core.DataFlow = DataFlow;


