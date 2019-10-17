#!/bin/bash
cd levels
for level in *.lvl; do
	COMMAND="exports.$(echo $level | cut -d. -f1) = require('fs').readFileSync('levels/$level');"
	echo $COMMAND
done > levels.js
