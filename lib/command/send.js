var inquirer = require('inquirer');
var fs = require('fs');
var log = require('../log');
var connectionUI = require('../connection');
var BufferReadable = require('stompit/lib/util/buffer/BufferReadable');

function init(nomnom) {
  
  var destinationOption = {
    abbr: 'd',
    required: true,
    help: 'set destination header'
  };
  
  var noresendOption = {
    flag: true,
    help: 'disable support for re-transmission of message'
  };
  
  var inputStringEncodingOption = {
    default: 'utf8',
    help: 'character encoding of input-string value'
  };
  
  var command = nomnom.command('send');
  
  connectionUI.loadCommandOptions(command);
  
  command.option('destination', destinationOption)
    .option('content-type', {help: 'set content-type headder'})
    .option('input-file', {help: 'send file'})
    .option('input-string', {help: 'send string'})
    .option('input-string-encoding', inputStringEncodingOption)
    .option('no-resend', noresendOption);
  
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
    
    body = new BufferReadable(new Buffer(
      options['input-string'], options['input-string-encoding']
    ));
  }
  else if ('input-file' in options) {
    body = fs.createReadStream(options['input-file']);  
  }
  else {
    body = process.stdin;
  }
  
  var sendMechanism = options['resend'] === false ? 
    sendViaClient : sendViaChannel;
  
  sendMechanism(headers, body, options, function(error) {
    
    if (error) {
      log.error(error.message);
      return;
    }
    
    log.status('sent message');
  });
}

function sendViaClient(headers, body, options, callback) {
  
  var connectionManager = connectionUI.createConnectionManager(options);
  
  connectionManager.connect(function(error, client) {
    
    if (error) {
      callback(error);
      return;
    }
    
    var frame = client.send(headers);
    
    body.pipe(frame);
    
    client.disconnect(callback);
  });
}

function sendViaChannel(headers, body, options, callback) {
  
  readToBuffer(body, function(error, bodyBuffer) {
    
    if (error) {
      callback(error);
      return;
    }
    
    connectionUI.createChannel(options).send(headers, bodyBuffer, callback);
  });
}

function readToBuffer(readable, callback) {
  
  var buffer = new Buffer(0);
  
  var read = function() {
    
    var chunk = readable.read();
    
    if (!chunk) {
      return;
    }
    
    buffer = Buffer.concat([buffer, chunk]);
  };
  
  readable.on('error', callback);
  
  readable.on('end', function() {
    callback(null, buffer);
  });
  
  readable.on('readable', read);
  read();
}

module.exports = {
  init: init
};
