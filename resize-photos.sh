#!/bin/bash
INPUT="$1"
OUTPUT="$2"
PARK_ID="$3"
mkdir -p "$OUTPUT"
count=1
for f in "$INPUT"/*.jpg "$INPUT"/*.JPG "$INPUT"/*.jpeg; do
  [ -f "$f" ] || continue
  padded=$(printf "%02d" $count)
  out="$OUTPUT/$PARK_ID-$padded.jpg"
  /usr/bin/convert "$f" -resize 1200x1200\> -quality 75 "$out"
  echo "✓ $f → $out"
  count=$((count + 1))
done
echo ""
echo "Done. $((count - 1)) photos saved to $OUTPUT"
