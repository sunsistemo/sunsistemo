#!/usr/bin/env bash
set -e

path="sunsistemo.github.io/"

cp index.html "$path"
cp style.css "$path"
cp -r textures/ "$path"
cp validation/index.html "$path"/validation/
cp report/sunsistemo.pdf "$path"
./node_modules/.bin/webpack --optimize-minimize --output-path "$path"
cd "$path"
# git mv CNAME CNAME-disabled
# git commit -m "force cloudfare cache refresh"
# git push
# sleep 300
# git mv CNAME-disabled CNAME
git add -A
git commit -m "update sunsistemo"
git push -u origin master
cd -
