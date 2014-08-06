#!/usr/bin/env node

var floraPac = require('./src/flora.js');

if (process.mainModule === module) {
    floraPac();
}

module.exports = floraPac;
