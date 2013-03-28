#!/bin/sh

curl -o lib/SqlString.js https://raw.github.com/felixge/node-mysql/v2.0.0-alpha7/lib/protocol/SqlString.js
patch -p0 < scripts/SqlString.patch
