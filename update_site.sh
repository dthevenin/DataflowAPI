#!/bin/sh

mkdir -p tmp/
git clone https://github.com/dthevenin/DataflowAPI.git tmp
rm -rf lib
rm -rf examples
mv tmp/lib .
mv tmp/examples .
rm -rf tmp

git submodule -q foreach git pull -q origin master
rsync -pvtrlL --exclude=.svn/ data/ examples
