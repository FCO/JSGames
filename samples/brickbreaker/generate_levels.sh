#!/bin/bash
cd brick_breaker_levels
for level in *.lvl; do
	COMMAND="exports.$(echo $level | cut -d. -f1) = require('fs').readFileSync('$(realpath --relative-to=.. $level)');"
	echo $COMMAND
done > levels.js
