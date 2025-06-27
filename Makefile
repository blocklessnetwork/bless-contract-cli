



all:
	npm run package
	sed -i '' '1s;^;#!/usr/bin/env node\n;' dist/index.js
