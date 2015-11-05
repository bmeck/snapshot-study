"use strict";

//
// node dump-nodes.js ./path/to/snapshot.json
//

const HeapSnapshot = require('../').HeapSnapshot;
const JSONSnapshotProvider = require('../').JSONSnapshotProvider;

const file = require('path').resolve(process.argv[2]); 
const name = process.argv[3];
const json = require(file);
const provider = new JSONSnapshotProvider(json);
const snapshot = new HeapSnapshot(provider);

let total_nodes = provider.getNodeArraySize() / provider.getMeta().node_fields.length;
// console.error('TOTAL', total_nodes);
// process.exit()

function walk(edge) { 
  const to_walk = [edge];
  const paths = [[]];
  const true_paths = [];
  const visited = [];
  const found = new Map();
  while(to_walk.length) {
    let node = to_walk.shift().getNode();
    let path_entry = {nt:node.node.type, n:node.node.name, ni:node.node.id};
	  let path = paths.shift().concat(path_entry);
	  //console.error('checking', node.node.id, visited.length / total_nodes);
    //const trace = node.getTraceNode() || {
    //  trace_function_info: null
    //};
    if (node.node.name === name) {
      true_paths.push(path);
      found.set(node.node.id, path_entry);
    }
    var i = 0;
    for (const item of node.walkEdges()) {
      var next_path = path.concat({et:item.edge.type, n:item.edge.name_or_index,ei:i,en:item.edge.to_node});
      if (item.edge.name_or_index === name) {
        true_paths.push(next_path);
      }
      if (visited.indexOf(item.edge.to_node) >= 0) {
        var possible = item.getNode();
        if (found.has(possible.node.id)) {
          true_paths.push(next_path.concat(found.get(possible.node.id)));
        }
        continue;
      }
      visited.push(item.edge.to_node);
	    paths.push(next_path);
      to_walk.push(item);
      i++;
    }
  }
  console.log(true_paths)
}
walk({
  getNode: function () {
    return snapshot.getNode(0)
  }
});
