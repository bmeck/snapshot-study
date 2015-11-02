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
  const contexts = {};
  while(to_walk.length) {
    let node = to_walk.shift().getNode();
	  let path = paths.shift().concat({nt:node.node.type, n:node.node.name});
	  //console.error('checking', node.node.id, visited.length / total_nodes);
    //const trace = node.getTraceNode() || {
    //  trace_function_info: null
    //};
    for (const item of node.walkEdges()) {
      if (visited.indexOf(item.edge.to_node) >= 0) {
        continue;
      }
      if (item.edge.type === 'context' && item.edge.name_or_index === name) {
        true_paths.push(path);
      }
      visited.push(item.edge.to_node);
	    paths.push(path.concat({et:item.edge.type, n:item.edge.name_or_index}));
      to_walk.push(item);
    }
  }
  console.log(true_paths)
}
walk({
  getNode: function () {
    return snapshot.getNode(0)
  }
});
