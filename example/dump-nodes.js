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
// CLOSURE: id of a closure scope (could be many of these per fn)
// NODE: id of the property being kept alive
// VARIABLE: string of the property of the CLOSURE (variable name)
// SCOPE: id of the thing keeping the closure alive (script, other closure, etc.)
function walk(edge) { 
  var to_walk = [edge];
  var visited = [];
  while(to_walk.length) {
    var node = to_walk.shift().getNode();
    if (visited.indexOf(node.node.id) >= 0) {
      continue;
    }
    visited.push(node.node.id);
    const trace = node.getTraceNode();
    console.log({
      node: node.node,
      trace_function_info: trace.trace_function_info
    });
    const iter = node.walkEdges();
    let item = iter.next();
    while (!item.done) {
      to_walk.push(item.value);
      item = iter.next();
    }
  }
}
walk({
  getNode: function () {
    return snapshot.getNode(0)
  }
});
