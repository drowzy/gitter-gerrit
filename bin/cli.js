#!/usr/bin/env node
'use strict';

var program = require('commander'),
    fs      = require('fs'),
    gitterProcess = require('../');

program
  .option('--config [config]', 'path to config file')
  .parse(process.argv);


if (program.config) {
  var config = JSON.parse(fs.readFileSync(program.config));
  gitterProcess(config);
}
