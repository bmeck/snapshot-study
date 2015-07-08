#include <v8-profiler.h>
#include "FileOutputStream.cc"

using v8::HeapProfiler;
using v8::HeapGraphNode;
using v8::HeapGraphEdge;
using v8::Handle;
using v8::Value;
using v8::Object;
using v8::String;
using v8::SnapshotObjectId;
using v8::Function;
using v8::ScriptOrigin;

const char* strForValueType(
  Handle<Value> value
) {
  if (value->IsUndefined()) {
    return "Undefined";
  }
  else if (value->IsNull()) {
    return "Null";
  }
  else if (value->IsTrue()) {
    return "True";
  }
  else if (value->IsFalse()) {
    return "False";
  }
  else if (value->IsName()) {
    return "Name";
  }
  else if (value->IsString()) {
    return "String";
  }
  else if (value->IsSymbol()) {
    return "Symbol";
  }
  else if (value->IsFunction()) {
    return "Function";
  }
  else if (value->IsArray()) {
    return "Array";
  }
  else if (value->IsObject()) {
    return "Object";
  }
  else if (value->IsBoolean()) {
    return "Boolean";
  }
  else if (value->IsNumber()) {
    return "Number";
  }
  else if (value->IsExternal()) {
    return "External";
  }
  else if (value->IsInt32()) {
    return "Int32";
  }
  else if (value->IsUint32()) {
    return "Uint32";
  }
  else if (value->IsDate()) {
    return "Date";
  }
  else if (value->IsArgumentsObject()) {
    return "ArgumentsObject";
  }
  else if (value->IsBooleanObject()) {
    return "BooleanObject";
  }
  else if (value->IsNumberObject()) {
    return "NumberObject";
  }
  else if (value->IsStringObject()) {
    return "StringObject";
  }
  else if (value->IsSymbolObject()) {
    return "SymbolObject";
  }
  else if (value->IsNativeError()) {
    return "NativeError";
  }
  else if (value->IsRegExp()) {
    return "RegExp";
  }
  else if (value->IsGeneratorFunction()) {
    return "GeneratorFunction";
  }
  else if (value->IsGeneratorObject()) {
    return "GeneratorObject";
  }
  else if (value->IsPromise()) {
    return "Promise";
  }
  else if (value->IsMap()) {
    return "Map";
  }
  else if (value->IsSet()) {
    return "Set";
  }
  else if (value->IsMapIterator()) {
    return "MapIterator";
  }
  else if (value->IsSetIterator()) {
    return "SetIterator";
  }
  else if (value->IsWeakMap()) {
    return "WeakMap";
  }
  else if (value->IsWeakSet()) {
    return "WeakSet";
  }
  else if (value->IsArrayBuffer()) {
    return "ArrayBuffer";
  }
  else if (value->IsArrayBufferView()) {
    return "ArrayBufferView";
  }
  else if (value->IsTypedArray()) {
    return "TypedArray";
  }
  else if (value->IsUint8Array()) {
    return "Uint8Array";
  }
  else if (value->IsUint8ClampedArray()) {
    return "Uint8ClampedArray";
  }
  else if (value->IsInt8Array()) {
    return "Int8Array";
  }
  else if (value->IsUint16Array()) {
    return "Uint16Array";
  }
  else if (value->IsInt16Array()) {
    return "Int16Array";
  }
  else if (value->IsUint32Array()) {
    return "Uint32Array";
  }
  else if (value->IsInt32Array()) {
    return "Int32Array";
  }
  else if (value->IsFloat32Array()) {
    return "Float32Array";
  }
  else if (value->IsFloat64Array()) {
    return "Float64Array";
  }
  else if (value->IsDataView()) {
    return "DataView";
  }
  return "<unknown>";
}

const char* strForHeapGraphEdgeType(
  const HeapGraphEdge* edge
) {
  int type = edge->GetType();
  if (type == HeapGraphEdge::Type::kContextVariable) {
    return "ContextVariable";
  }
  if (type == HeapGraphEdge::Type::kElement) {
    return "Element";
  }
  if (type == HeapGraphEdge::Type::kProperty) {
    return "Property";
  }
  if (type == HeapGraphEdge::Type::kInternal) {
    return "Internal";
  }
  if (type == HeapGraphEdge::Type::kHidden) {
    return "Hidden";
  }
  if (type == HeapGraphEdge::Type::kShortcut) {
    return "Shortcut";
  }
  if (type == HeapGraphEdge::Type::kWeak) {
    return "Weak";
  }
  return "<unknown>";
}

const char* strForHeapGraphNodeType(
  const HeapGraphNode* node
) {
  int type = node->GetType();
  if (type == HeapGraphNode::Type::kHidden) {
    return "Hidden";
  }
  if (type == HeapGraphNode::Type::kArray) {
    return "Array";
  }
  if (type == HeapGraphNode::Type::kString) {
    return "String";
  }
  if (type == HeapGraphNode::Type::kObject) {
    return "Object";
  }
  if (type == HeapGraphNode::Type::kCode) {
    return "Code";
  }
  if (type == HeapGraphNode::Type::kClosure) {
    return "Closure";
  }
  if (type == HeapGraphNode::Type::kRegExp) {
    return "RegExp";
  }
  if (type == HeapGraphNode::Type::kHeapNumber) {
    return "HeapNumber";
  }
  if (type == HeapGraphNode::Type::kNative) {
    return "Native";
  }
  if (type == HeapGraphNode::Type::kSynthetic) {
    return "Synthetic";
  }
  if (type == HeapGraphNode::Type::kConsString) {
    return "ConsString";
  }
  if (type == HeapGraphNode::Type::kSlicedString) {
    return "SlicedString";
  }
  if (type == HeapGraphNode::Type::kSymbol) {
    return "Symbol";
  }
  return "<unknown>";
}

class StringSetNode {
  public:
    StringSetNode(const char* value, const size_t len) : value_((const char*)malloc(len)), len_(len), next_(NULL) {
      memcpy((void*)value_, (void*)value, len_);
    }
    ~StringSetNode() {
      free((void*)value_);
      if (next_ != NULL) {
        delete next_;
      }
    }
    const size_t FindOrInsert(const char* value, const size_t len) {
      return FindOrInsert(value, len, 1);
    }
    //TODO dump method
  private:
    const size_t FindOrInsert(const char* value, const size_t len, const size_t i) {
      if (len_ == len && memcmp(value, value_, len_)) {
        return i;
      }
      else {
        if (next_ != NULL) {
          return next_->FindOrInsert(value, len, i+1);
        }
        next_ = new StringSetNode(value, len);
        return i + 1;
      }
    }
    const char* value_;
    const size_t len_;
    StringSetNode* next_;
};
class StringSet {
  public:
    StringSet() : root_(NULL) {}
    ~StringSet() {
      if (root_ != NULL) delete root_;
    }
    const size_t FindOrInsert(const char* value, const size_t len) {
      if (root_ == NULL) {
        root_ = new StringSetNode(value, len);
      }
      return root_->FindOrInsert(value, len);
    }
  private:
    StringSetNode* root_;
};

void dumpInt(FileOutputStream* fninfo_stream, const int value) { 
  char str[20];
  int str_len = snprintf(str, 20, "%d", value);
  // 1e20 > MAXINT so we are safe
  if (str_len > 19) {
    str_len = 19;
  }
  fninfo_stream->WriteAsciiChunk(str, str_len);
}

void dumpStringReference(FileOutputStream* fninfo_stream, StringSet* strings, const char* value, const int len) { 
  int index = strings->FindOrInsert(value, len);
  dumpInt(fninfo_stream, index);
}
void dumpStringReference(FileOutputStream* fninfo_stream, StringSet* strings, const char* value) {
  int len = strlen(value);
  int index = strings->FindOrInsert(value, len);
  dumpInt(fninfo_stream, index);
}

void dumpStringReference(FileOutputStream* fninfo_stream, StringSet* strings, Handle<Value> value) {
  if (value.IsEmpty()) {
    fninfo_stream->WriteAsciiChunk("null", 4);
    return;
  }
  String::Utf8Value utf8(value);
  return dumpStringReference(fninfo_stream, strings, *utf8, utf8.length());
}


void dumpHeapGraphNode(
  FileOutputStream* fninfo_stream,
  const HeapProfiler* profiler,
  const HeapGraphNode* node,
  StringSet* strings
) {
  SnapshotObjectId id = node->GetId();
  Handle<Value> value = const_cast<HeapProfiler*>(profiler)->FindObjectById(id);
  if (value.IsEmpty()) {
    return;
  }
  if (!value->IsFunction()) {
    return;
  }
  Handle<Function> fn = Handle<Function>::Cast(value);
  ScriptOrigin origin = fn->GetScriptOrigin();

  dumpInt(fninfo_stream, id);
  fninfo_stream->WriteAsciiChunk(",", 1);

  dumpStringReference(fninfo_stream, strings, node->GetName());
  fninfo_stream->WriteAsciiChunk(",", 1);

  dumpStringReference(fninfo_stream, strings, strForHeapGraphNodeType(node));
  fninfo_stream->WriteAsciiChunk(",", 1);

  dumpStringReference(fninfo_stream, strings, strForValueType(value));
  fninfo_stream->WriteAsciiChunk(",", 1);

  if (fn->IsBuiltin()) {
    fninfo_stream->WriteAsciiChunk("true", 4);
  }
  else {
    fninfo_stream->WriteAsciiChunk("false", 5);
  }
  fninfo_stream->WriteAsciiChunk(",", 1);

  dumpStringReference(fninfo_stream, strings, fn->GetName());
  fninfo_stream->WriteAsciiChunk(",", 1);

  dumpStringReference(fninfo_stream, strings, fn->GetInferredName()); 
  fninfo_stream->WriteAsciiChunk(",", 1);

  dumpStringReference(fninfo_stream, strings, fn->GetDisplayName()); 
  fninfo_stream->WriteAsciiChunk(",", 1);

  dumpInt(fninfo_stream, fn->GetScriptLineNumber());
  fninfo_stream->WriteAsciiChunk(",", 1);

  dumpInt(fninfo_stream, fn->GetScriptColumnNumber());
  fninfo_stream->WriteAsciiChunk(",", 1);

  dumpStringReference(fninfo_stream, strings, origin.ScriptID());
  fninfo_stream->WriteAsciiChunk(",", 1);

  dumpStringReference(fninfo_stream, strings, origin.ResourceName());
  fninfo_stream->WriteAsciiChunk(",", 1);

  dumpStringReference(fninfo_stream, strings, origin.ResourceLineOffset());
  fninfo_stream->WriteAsciiChunk(",", 1);

  dumpStringReference(fninfo_stream, strings, origin.ResourceColumnOffset());
  fninfo_stream->WriteAsciiChunk(",", 1);

  dumpStringReference(fninfo_stream, strings, origin.ResourceIsSharedCrossOrigin());
}
