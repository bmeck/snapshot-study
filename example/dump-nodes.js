"use strict";

//
// node dump-nodes.js ./path/to/snapshot.json
//

const HeapSnapshot = require('../').HeapSnapshot;
const JSONSnapshotProvider = require('../').JSONSnapshotProvider;

const file = require('path').resolve(process.argv[2]); 
const json = require(file);
const provider = new JSONSnapshotProvider(json);
const snapshot = new HeapSnapshot(provider);

function walk(edge) { 
  const to_walk = [edge];
  const visited = [];
  while(to_walk.length) {
    let node = to_walk.shift().getNode();
    if (visited.indexOf(node.node.id) >= 0) {
      continue;
    }
    visited.push(node.node.id);
    const trace = node.getTraceNode() || {
      trace_function_info: null
    };
    process.stdout.write(`${JSON.stringify(node)}\n`);
    for (const item of node.walkEdges()) {
      to_walk.push(item);
      process.stdout.write(`${JSON.stringify(item)}\n`);
    }
  }
}
walk({
  getNode: function () {
    return snapshot.getNode(0)
  }
});
