#include <v8.h>
#include <v8-profiler.h>
#include <stdio.h>
#include "FileOutputStream.h"
int FileOutputStream::GetChunkSize() {
  return 65536;  // big chunks == faster
}

void FileOutputStream::EndOfStream() {}

FileOutputStream::WriteResult FileOutputStream::WriteAsciiChunk(char* data, int size) {
  const size_t len = static_cast<size_t>(size);
  size_t off = 0;

  while (off < len && !feof(stream_) && !ferror(stream_))
    off += fwrite(data + off, 1, len - off, stream_);

  return off == len ? kContinue : kAbort;
}
