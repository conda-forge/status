#!/bin/bash
# this script is for manually deploying the status page

git checkout main
git reset --hard HEAD
python render_page.py

git checkout gh-pages
cp site/* .
rm -rf site
git add *
git commit -m 'deploy the page'
git push

git checkout main
