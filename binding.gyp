{
  "targets": [
    {
      "target_name": "SnapshotStudy",
      "sources": [
        "src/FileOutputStream.cc",
        "src/addon.cc"
      ],
      "include_dirs"  : [
            "<!(node -e \"require('nan')\")"
      ],
      "cflags": ["-g"]
    }
  ]
}
