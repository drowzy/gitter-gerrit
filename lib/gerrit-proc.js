'use strict';

var Client = require('ssh2').Client,
    fs     = require('fs'),
    EOL    = require('os').EOL,
    Channel = require('./channel');


function GerritProcess (config) {
  if(!(this instanceof GerritProcess)) { return new GerritProcess(config); }

  this.connection = new Client();
  this.config     = config;
  this.chunk      = new Buffer([]);
  this.channels   = config.channels.map(function (options) { return new Channel(options); });

  this.connect();
}

var app = GerritProcess.prototype;

app.dataHandler = function (obj) {
  this.chunk = Buffer.concat([ this.chunk, obj ]);

  if (obj.toString('utf-8').slice(-1) !== EOL) {
    return;
  }

  var data = JSON.parse(this.chunk);

  this.channels.forEach(function (channel) {
    channel.send(data);
  });

  this.chunk = new Buffer([]);
};

app.connect = function () {
  this.connection.on('ready', function () {

    this.connection.exec('gerrit stream-events', function (err, stream) {
      if (err) {
       throw err;
      }

      console.log('Connected :: to: ' + this.config.host);

      stream
      .on('close', function (code, signal) { console.log('Stream :: close :: code: ' + code + ', signal: ' + signal); })
      .on('data', this.dataHandler.bind(this))
      .on('end', function (data) {
        console.log('end of data', data);
      })
      .stderr.on('data', function (data) { console.log('STDERR: ' + data); });

    }.bind(this));
  }.bind(this))

  .connect({
    host: this.config.host,
    port: this.config.port,
    username: this.config.username,
    privateKey: fs.readFileSync(this.config.privatekey)
  });
};

exports = module.exports = GerritProcess;
