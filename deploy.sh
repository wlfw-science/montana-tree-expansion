ng build --base-href "https://app.landscapeexplorer.org/"
# ng build --base-href "https://wlfw-science.github.io/landscape-explorer/"
cp ./dist/index.html ./dist/404.html
cp ./dist/index.html ./dist/200.html
echo app.landscapeexplorer.org > ./dist/CNAME
/usr/local/bin/ngh:
