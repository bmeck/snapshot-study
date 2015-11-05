#include <v8.h>
#include <v8-profiler.h>
#include <stdio.h>
#ifndef __FileOutputStream
#define __FileOutputStream
class FileOutputStream : public v8::OutputStream {
 public:
  FileOutputStream(FILE* stream) : stream_(stream) {}

  virtual int GetChunkSize();

  virtual void EndOfStream();

  virtual WriteResult WriteAsciiChunk(char* data, int size);

 private:
  FILE* stream_;
};
#endif
