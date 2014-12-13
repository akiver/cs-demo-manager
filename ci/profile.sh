demofile="$1"
output_pipe="$2"
mono --optimize=all "--profile=log:alloc,calls,heapshot=10000ms,time=fast,maxframes=3,output=|./ci/analyze.sh $output_pipe" \
 DevNullPlayer/bin/Release/DevNullPlayer.exe "testdemos/$demofile"
