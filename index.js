var binding = require('bindings')('SnapshotStudy.node');
exports.writeFiles = binding.writeFiles;
var lib = require('./out');
exports.HeapSnapshot = lib.HeapSnapshot;
exports.JSONSnapshotProvider = lib.JSONSnapshotProvider;
