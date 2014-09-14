var stompit = require('stompit');
var inquirer = require('inquirer');
var fs = require('fs');
var utils = require('../utils');
var println = utils.println;
var loadConfigFile = utils.loadConfigFile;

function init(nomnom) {
  
  var configOption = {
    abbr: 'c',
    help: 'filename of config file',
    default: '.stomp_config.yml'
  };
  
  var destinationOption = {
    abbr: 'd',
    required: true,
    help: 'set destination header'
  };
  
  nomnom.command('send')
    .option('config', configOption)
    .option('destination', destinationOption)
    .option('content-type', {help: 'set content-type headder'})
    .option('input-file', {help: 'send file'})
    .option('input-string', {help: 'send string'})
    .callback(send);
}

function send(options) {
  
  var config = loadConfigFile(options.config);
  
  var headers = {
    destination: options.destination
  };
  
  if ('content-type' in options) {
    headers['content-type'] = options['content-type'];
  }
  
  var body;
  
  if ('input-string' in options) {
    body = options['input-string'];
  }
  else if ('input-file' in options) {
    body = fs.createReadStream(options['input-file']);  
  }
  else {
    body = process.stdin;
  }
  
  var connectionManagement = new stompit.ConnectFailover(
    config.servers, 
    config.failover
  );
  
  connectionManagement.on('error', function(error, server) {
    
    println(utils.format(
      'Unable to connect to \'%s\': %s', 
       utils.formatServerAddress(server), 
       error.message
    ));
  });
  
  connectionManagement.on('connect', function(server) {
    
    println(utils.format(
      'Connected to %s', utils.formatServerAddress(server)
    ));
  });
  
  var channel = new stompit.Channel(connectionManagement);
  
  channel.send(headers, body, function(error) {
    
    if (error) {
      println('Error: ' + error.message);
      return;
    }
    
    println('Success: sent message');
  });
}

module.exports = {
  init: init
};
