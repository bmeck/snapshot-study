# snapshot-study
Tool for generating extra useful informations when gathering heap snapshots and useful information afterward

## Build

```
npm run build
```

Will take the library code in `lib/` and compile it in `out/`

## Usage

Due to memory constraints when working with large numbers of object incremental queries are the preferred API.
To do this we use generators and most sub-objects are gathered via methods rather than being readily available.
We do not use getters/setters.

## Examples

See `examples/`, each is short enough to read the code of.

## JSONSnapshotProvider

A generic means to access a heap snapshot, this will load the entire snapshot into memory. It should mostly be used for development of this library and testing purposes.

```
new snapshotStudy.JSONSnapshotProvider(heapsnapshot_json);
```

## HeapSnapshot

```
new snapshotStudy.HeapSnapshot(snapshotProvider);
```

### snapshot.getNode(n) 

Gets a snapshot `n` from the snapshot, this should match the a node's `id` field. 

```
snapshot.getNode(0); // get the root of the snapshot
```

### Node.getTraceNode()

If a snapshot has trace info this will get the relevant info for this node.

### Node.walkEdges()

This returns an iterator of edges this node points to.

### Edge.getNode()

This returns the destination node of this edge.

