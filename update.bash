#!/usr/bin/env bash
set -e

git checkout gh-pages
git merge master -m "merge master"
./node_modules/.bin/webpack --optimize-minimize
git add -A
git add --force sunsistemo.js validation/validation.js
git commit -m "update sunsistemo"
git push -u origin gh-pages
git checkout master
