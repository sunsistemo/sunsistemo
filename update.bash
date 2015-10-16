#!/usr/bin/env bash
path="sunsistemo.github.io/"

cp index.html "$path"
cp style.css "$path"
cp -r textures/ "$path"
cp -r lib/ "$path"
webpack --optimize-minimize --output-path "$path"
cd "$path"
git add -A
git commit -m "update sunsistemo"
git push -u origin master
cd -
