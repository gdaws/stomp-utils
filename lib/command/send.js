var stompit = require('stompit');
var inquirer = require('inquirer');
var yaml = require('js-yaml');
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
  
  nomnom.command('send')
    .option('config', configOption)
    .callback(send);
}

function send(options) {
  
  var config = loadConfigFile(options.config);
  
  var connectionManagement = new stompit.ConnectFailover(
    config.servers, 
    config.failover
  );
  
  var channel = new stompit.Channel(connectionManagement);
  
  var frameReader = new stompit.IncomingFrameStream();
  
  function readFrame() {
    
    var frame = frameReader.read();
    
    if (!frame) {
      return;
    }
    
    channel.send(frame.headers, frame, function(error) {
      
      if (error) {
        println('Error: ' + error.message);
      }
      else{
        println('Notice: sent frame');
      }
    });
  }
  
  frameReader.on('readable', readFrame);
  
  process.stdin.pipe(frameReader);
}

module.exports = {
  init: init
};
