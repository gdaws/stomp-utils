var inquirer = require('inquirer');
var fs = require('fs');
var utils = require('../utils');
var println = utils.println;
var connectionUI = require('../connection');

function init(nomnom) {
  
  var destinationOption = {
    abbr: 'd',
    required: true,
    help: 'set destination header'
  };
  
  var command = nomnom.command('send');
  
  connectionUI.loadCommandOptions(command);
  
  command.option('destination', destinationOption)
    .option('content-type', {help: 'set content-type headder'})
    .option('input-file', {help: 'send file'})
    .option('input-string', {help: 'send string'});
  
  command.callback(send);
}

function send(options) {
  
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
  
  var channel = connectionUI.createChannel(options);
  
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
