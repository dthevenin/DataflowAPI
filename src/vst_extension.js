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

