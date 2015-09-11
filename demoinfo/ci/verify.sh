set -eu

demofile="$1"
output_pipe="$2"

# Bitstream-Debugging, no profiling.
mono --optimize=all DevNullPlayer/bin/Debug/DevNullPlayer.exe "testdemos/$demofile" "/dev/fd/$output_pipe"
