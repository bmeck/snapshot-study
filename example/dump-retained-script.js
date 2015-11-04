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

function routeNodeEdges(node, route) {
  for (const item of node.walkEdges()) {
    const name = item.edge.name_or_index;
    if (route[name] && Object.prototype.hasOwnProperty.call(route, name)) {
      route[name](item, item.getNode());
    }
  }
}

function walk(edge) { 
  const to_walk = [edge];
  const visited = new Set();
  // ref index => set script index
  const retainers = new Map();
  while(to_walk.length) {
    let node = to_walk.shift().getNode();
    if (visited.has(node.index)) {
      continue;
    }
    visited.add(node.index);
    const refs = new Set();
    let script_index = null;
    if (node.node.type === 'closure') {
      routeNodeEdges(node, {
        context(item, node) {
          if (item.edge.type !== 'internal') return;
          Array.from(node.walkEdges())
              .filter(i=>i.edge.type==='context')
              .map(i=>i.getNode().index)
              .forEach(index=>refs.add(index));
        },
        shared(item, node) {
          if (item.edge.type !== 'internal') return;
          routeNodeEdges(node, {
            script(item, node) {
              script_index = node.index;
            }
          });
        }
      });
    }
    if (refs.size) {
      for (const ref of refs) {
        if (!retainers.has(ref)) {
          retainers.set(ref, new Set());
        }
        const retainer = retainers.get(ref);
        retainer.add(script_index);
      }
    }
    for (const item of node.walkEdges()) {
      if (visited.has(item.edge.to_node)) {
        continue;
      }
      to_walk.push(item);
    }
  }
  // refs, shared
  const ret = new Map();
  for (const entry of retainers.entries()) {
    const ref = snapshot.getNode(entry[0]);
    const scripts = entry[1];
    let map = ret;
    let refs;
    for (const script of scripts) {
      if (!map.has(script)) {
        map.set(script, {
          refs: refs = new Set(),
          shared: map = new Map()
        });
      }
      else {
        let info = map.get(script);
        map = info.shared;
        refs = info.refs;
      }
    }
    refs.add({
      id: ref.node.id,
      retained_size: Math.floor(Math.random()*50) * 16
    });
  }
  process.stdout.write('[\n');
  let first = true;
  function dump(map, path) {
    for (const entry of map.entries()) {
      const script_index = entry[0];
      const info = entry[1];
      const script_node = snapshot.getNode(script_index);
      let script_name;
      routeNodeEdges(script_node,{
        name(item, node) {
          script_name = node.node.name;
        }
      });
      const next_path = path.concat({
        id: script_node.node.id,
            name: script_name
      });
      if (info.refs.size) {
        if (first) first = false;
        else process.stdout.write(', ');
        process.stdout.write(JSON.stringify({
          scripts: next_path,
          refs: Array.from(info.refs)
        }));
        process.stdout.write('\n');
      }
      if (info.shared.size) {
        dump(info.shared, next_path);
      }
    }
  }
  dump(ret, []);
  process.stdout.write(']\n');
}
walk({
  getNode: function () {
    return snapshot.getNode(0)
  }
});
