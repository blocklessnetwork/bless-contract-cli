
all:
	npm run package
	sed -i.bak '1s;^;#!/usr/bin/env node\n;' dist/index.js || sed -i '1s;^;#!/usr/bin/env node\n;' dist/index.js
