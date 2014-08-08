#!/usr/bin/env node

var floraPac = module.exports = require('./src/flora.js');

if (process.mainModule === module) {
    floraPac.main();
}
