#!/usr/bin/env bash
path="sunsistemo.github.io/"

cp index.html "$path"
webpack --optimize-minimize --output-path "$path"
cd "$path"
git add -A
git commit -m "update sunsistemo"
git push -u origin master
