#!/bin/bash
# adapted from http://stackoverflow.com/a/18686955/1590632
out_fd="$1"
mprof-report --method-sort=self --traces --maxframes=3 \
  --reports=header,jit,gc,thread,monitor,metadata,exception,sample,call,alloc,heapshot,counters - >&"$out_fd"
