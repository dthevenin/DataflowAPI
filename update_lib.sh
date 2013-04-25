#!/bin/sh

rm -rf lib_ext

mkdir -p tmp/
git clone https://github.com/vinisketch/VSToolkit.git tmp
mv tmp/lib_debug lib_ext
rm -rf tmp

mkdir -p tmp/
git clone https://github.com/dthevenin/AnimatedTransition.git tmp
cp tmp/lib/animatedtransition.js lib_ext/
rm -rf tmp
