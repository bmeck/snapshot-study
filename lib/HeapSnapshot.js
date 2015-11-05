class HeapSnapshot {
  constructor(provider) {
    const meta = provider.getMeta(); 
    this.node_fields = meta.node_fields;
    this.node_edge_count_field = this.node_fields.indexOf('edge_count');
    this.node_types = meta.node_types;
    this.edge_fields = meta.edge_fields;
    this.edge_types = meta.edge_types;
    this.trace_function_info_fields = meta.trace_function_info_fields;
    this.trace_node_fields = meta.trace_node_fields;
    this.provider = provider;
  }

  getNode(node_index) {
    //const node_index = n * this.node_fields.length;
    if (node_index > this.provider.getNodeArraySize()) {
      return null;
    }
    const node_array_slice = this.provider.getNodeArraySlice(
      node_index,
      node_index + this.node_fields.length);
    const node = Object.create(null);
    for (let i = 0; i < this.node_fields.length; i++) {
      const field = this.node_fields[i];
      let value = node_array_slice[i];
      if (field == 'type') {
        value = this.node_types[0][value];
      }
      else if (field == 'name') {
        value = this.provider.getString(value);
      }
      node[field] = value;
    }
    const edge_count = node.edge_count; 
    const edge_index = this.provider.getEdgeIndexForNode(node_index);
    const self = this;
    return {
      node,
      index: node_index,
      getTraceNode() {
        return self.getTraceFunctionInfo(node.trace_node_id);
      },
      *walkEdges() {
        for (let i = 0; i < edge_count; i++) {
          let e = self.getEdge(edge_index + i);
          if (e != null) {
            yield e;
          }
        }
      }
    };
  }

  getEdge(n) {
    const edge = Object.create(null);
    const edge_index = n * this.edge_fields.length;
    if (edge_index > this.provider.getEdgeArraySize()) {
      return null;
    }
    const edge_array_slice = this.provider.getEdgeArraySlice(
      edge_index,
      edge_index + this.edge_fields.length);
    for (let i = 0; i < this.edge_fields.length; i++) {
      const field = this.edge_fields[i];
      let value = edge_array_slice[i];
      if (field == 'type') {
        value = this.edge_types[0][value];
      }
      else if (field == 'name_or_index' && edge.type != 'element') {
        value = this.provider.getString(value);
      }
      //else if (field == 'to_node') {
      //  value = value / this.node_fields.length; 
      //}
      edge[field] = value;
    }
    const self = this;
    return {
      edge,
      index: edge_index,
      getNode() {
        return self.getNode(edge.to_node);
      }
    };
  }

  getTraceFunctionInfo(n) {
    if (!this.trace_function_info_fields) return null;
    const trace_function_info = Object.create(null);
    const trace_index = n * this.trace_function_info_fields.length;
    const trace_array_slice = this.provider.getTraceFunctionInfoArraySlice(
      trace_index,
      trace_index + this.trace_function_info_fields.length);
    for (let i = 0; i < this.trace_function_info_fields.length; i++) {
      const field = this.trace_function_info_fields[i];
      let value = trace_array_slice[i];
      if (field == 'name' || field == 'script_name') {
        value = this.provider.getString(value);
      }
      trace_function_info[field] = value;
    }
    const self = this;
    return {
      trace_function_info
    }
  }
}
export default HeapSnapshot;
