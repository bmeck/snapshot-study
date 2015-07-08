// addon.cc
#include <node.h>
#include <nan.h>
#include <stdio.h>
#include <set>
#include <v8-profiler.h>
#include "addon.h"
#include "FileOutputStream.cc"

using v8::Handle;
using v8::Object;
using v8::String;
using v8::Array;
using v8::Number;
using v8::Local;
using v8::Value;
using v8::Function;
using v8::FunctionTemplate;

using v8::ScriptOrigin;

using v8::HeapProfiler;
using v8::HeapSnapshot;
using v8::HeapGraphNode;
using v8::HeapGraphEdge;

unsigned long dump(
  FileOutputStream* fninfo_stream,
  const HeapProfiler* profiler,
  const HeapGraphNode* node,
  unsigned int visited_count = 0, 
  unsigned int seen_closures = false,
  std::set<SnapshotObjectId>* visited = NULL,
  StringSet* strings = new StringSet
) {
  bool cleanup = visited == NULL;
  if (cleanup) {
    visited = new std::set<SnapshotObjectId>();
  }
  SnapshotObjectId id = node->GetId();
  //if (node->GetName()->IsString()==false) printf("TYPE OF NAME %s\n", strForValueType(node->GetName()));
  const char* node_name = *String::Utf8Value(node->GetName());

  std::set<SnapshotObjectId>::iterator pos = visited->find(id);
  if (pos != visited->end()) {
    return visited_count;
  }
  visited->insert(id);
  visited_count++;

  unsigned int count = node->GetChildrenCount();

  HeapGraphNode::Type node_type = node->GetType();
  if (node_type == HeapGraphNode::Type::kClosure) {
    if (seen_closures) {
      fninfo_stream->WriteAsciiChunk(",\n", 2);
    }
    dumpHeapGraphNode(fninfo_stream, profiler, node, strings); 
    seen_closures = true;
  }
  for (unsigned int i = 0; i < count; i++) {
    const HeapGraphEdge* edge;
    edge = node->GetChild(i);
    const char* name = *String::Utf8Value(edge->GetName());
    const HeapGraphNode* child = edge->GetToNode();
    visited_count = dump(fninfo_stream, profiler, child, visited_count, seen_closures, visited, strings); 
  }
  // fprintf(stderr, "<<\n");
  if (cleanup) {
    free(visited);
  }
  return visited_count;
}

// Simple synchronous access to the `Estimate()` function
NAN_METHOD(WriteFiles) {
  NanScope();

  const HeapProfiler* profiler = v8::Isolate::GetCurrent()->GetHeapProfiler();

  const HeapSnapshot* snapshot = const_cast<HeapProfiler*>(profiler)->TakeHeapSnapshot(
    NanNew("snappy")
  );

  const char* heapsnapshot = "heapsnapshot.json";
  const char* fninfo = "fninfo.json";

  FILE* heap_fp = fopen(heapsnapshot, "w");
  if (heap_fp == NULL) {
    return NanThrowError("unable to open heapsnapshot for writing");
  }
  FileOutputStream heap_stream(heap_fp);
  FILE* fninfo_fp = fopen(fninfo, "w");
  if (fninfo_fp == NULL) {
    return NanThrowError("unable to open fninfo for writing");
  }
  FileOutputStream fninfo_stream(fninfo_fp);
  fninfo_stream.WriteAsciiChunk("[", 1);
  snapshot->Serialize(&heap_stream, v8::HeapSnapshot::kJSON);
  const_cast<HeapSnapshot*>(snapshot)->Delete();
  fninfo_stream.WriteAsciiChunk("]", 1);
  // TODO dump strings
  fclose(heap_fp);

  const HeapGraphNode* root = snapshot->GetRoot();
  dump(&fninfo_stream, profiler, root, -1);
  fclose(fninfo_fp);

  NanReturnUndefined();
}

void InitAll(Handle<Object> exports) {
  exports->Set(NanNew<String>("writeFiles"),
    NanNew<FunctionTemplate>(WriteFiles)->GetFunction());
}

NODE_MODULE(SnapshotStudy, InitAll)
