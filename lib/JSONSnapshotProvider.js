class JSONSnapshotProvider {
  constructor(json) {
    this.json = json;
  }

  getNodeArraySize() {
    return this.json.nodes.length;
  }

  getNodeArraySlice(b,e) {
    return this.json.nodes.slice(b,e);
  }

  getEdgeArraySize() {
    return this.json.edges.length;
  }

  getEdgeArraySlice(b,e) {
    return this.json.edges.slice(b,e);
  }

  getEdgeIndexForNode(n) {
    let edge_index = 0;
    let inc = this.getMeta().node_fields.length;
    let edge_field = this.getMeta().node_fields.indexOf('edge_count');
    for (let i = 0; i < n; i+=inc) {
      edge_index += this.json.nodes[i + edge_field];
    }
    return edge_index;
  }

  getTraceFunctionInfoArraySize() {
    return this.json.trace_function_infos.length;
  }

  getTraceFunctionInfoArraySlice(b,e) {
    return this.json.trace_function_infos.slice(b,e);
  }

  getTraceTreeArraySize() {
    return this.json.trace_tree.length;
  }

  getTraceTreeArraySlice(b,e) {
    return this.json.trace_tree.slice(b,e);
  }

  getStringArraySize() {
    return this.json.strings.length;
  }

  getString(n) {
    return this.json.strings[n];
  }

  getMeta() {
    return this.json.snapshot.meta;
  }
}
export default JSONSnapshotProvider;
