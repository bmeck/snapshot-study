"use strict";

//
// node dump-nodes.js ./path/to/snapshot.json
//

const HeapSnapshot = require('../').HeapSnapshot;
const JSONSnapshotProvider = require('../').JSONSnapshotProvider;

const file = require('path').resolve(process.argv[2]); 
const id = process.argv[3];
const json = require(file);
const provider = new JSONSnapshotProvider(json);
const snapshot = new HeapSnapshot(provider);

function walk(edge) { 
  const to_walk = [{
    edge,
    path: new Set()
  }];
  const visited = new Set();
  // index => [index]
  const paths_from_root = new Map();
  while(to_walk.length) {
    const task = to_walk.shift();
    const node = task.edge.getNode();
    const lineage = new Set(task.path);
    lineage.add(node.index);
    if (!paths_from_root.has(node.index)) {
      paths_from_root.set(node.index, lineage);
    }
    else {
      const known_doms = paths_from_root.get(node.index);
      for (const dom of known_doms) {
        if (!lineage.has(dom)) {
          known_doms.delete(dom);
        }
      }
    }
    if (visited.has(node.index)) continue;
    // not seend before
    visited.add(node.index);
    for (const edge of node.walkEdges()) {
      to_walk.push({
        edge,
        path: lineage 
      });
    }
  }
  let i = 0;
  for (const entry of paths_from_root.entries()) {
    let i = 1;
    let doms = entry[1];
    let dom;
    if (doms.size === 1) {
      dom = doms.values().next().value;
    }
    else {
      for (const needle of doms) {
        if (i == doms.size - 1) {
          dom = needle;
          break;
        }
        i++;
      }
    }
    console.log(
      entry[0], 'dominated by', dom
    );
  }
}
walk({
  getNode: function () {
    return snapshot.getNode(0)
  }
});
