var fs = require('fs');
var utils = require('../utils');
var log = require('../log');
var connectionUI = require('../connection');

function init(nomnom) {
  
  var command = nomnom.command('subscribe');
  
  connectionUI.loadCommandOptions(command);
  
  command.option('destination', {
    abbr: 'd',
    required: true,
    help: 'set destination header'
  });
  
  command.option('no-ack', {
    flag: true,
    help: 'don\'t send acknowledgement'
  });
  
  command.option('nack', {
    flag: true,
    help: 'send negative acknowledgement'
  });
  
  command.callback(subscribe);
}

function subscribe(options) {
  
  var channel = connectionUI.createChannel(options);
  
  var headers = {
    destination: options.destination,
    ack: 'client-individual'
  };
  
  channel.subscribe(headers, function(error, message) {
    
    if (error) {
      log.error(error.message);
      return;
    }
    
    bufferMessage(message, function(error, buffer) {
      
      if (error) {
        log.error(error.message);
        return;
      }
      
      if (!('ack' in options) || options['ack']) {
        
        if ('nack' in options && options['nack']) {
          message.nack();
        }
        else {
          message.ack();
        }
      }
      
      process.stdout.write(buffer);
      
      channel.close();
    });
  });
}

function bufferMessage(message, callback) {
  
  var buffer = new Buffer(0);
  
  message.on('error', function(error) {
    callback(error);
  });
  
  message.on('end', function() {
    callback(null, buffer);
  });
  
  var readChunk = function() {
    
    var chunk = message.read();
    
    if (!chunk) {
      return;
    }
    
    buffer = Buffer.concat([buffer, chunk], buffer.length + chunk.length);
  };
  
  message.on('readable', readChunk);
  
  readChunk();
}

module.exports = {
  init: init
};
