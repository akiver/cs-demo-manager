set -eu

demofile="$1"

# Bitstream-Debugging, no profiling.
mono --optimize=all DevNullPlayer/bin/Debug/DevNullPlayer.exe "testdemos/$demofile"
