#!/bin/sh

curl -o lib/SqlString.js https://raw.github.com/felixge/node-mysql/master/lib/protocol/SqlString.js 
patch -p0 < scripts/SqlString.patch
