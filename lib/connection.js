var yaml = require('js-yaml');
var fs = require('fs');
var path = require('path');
var util = require('util');
var println = require('./utils').println;
var stompit = require('stompit');

function loadCommandOptions(command) {
  
  command.option('config', {
    abbr: 'c',
    help: 'filename of config file',
    default: '.stomp_config.yml'
  });
}

function findFile(filename, searchPaths) {

  // Test original filename in case it's an absolute path
  if (fs.existsSync(filename)) {
    return filename;
  }
  
  var length = searchPaths.length;
  var resolvedFilename;
  
  for(var i = 0; i < length; i++) {

    resolvedFilename = path.join(searchPaths[i], filename);
    
    if (fs.existsSync(resolvedFilename)) {
      return resolvedFilename;
    }
  }
}

function loadConfigFile(filename) {
  
  var resolvedFilename = findFile(filename, [
    process.cwd(), 
    process.env.HOME 
  ]);
  
  if (!resolvedFilename) {
    
    println('Error: Failed to find config file \'' + filename + '\'');
    
    throw new Error('file not found \'' + filename + '\'');
  }
  
  try {
    var data = fs.readFileSync(resolvedFilename, 'utf8');
  }
  catch(e) {
    
    println('Error: Failed to load config file \'' + 
      filename + '\': ' + e.message);
    
    throw e;
  }
  
  try {
    return yaml.safeLoad(data);
  }
  catch(e) {
    
    println('Error: Failed to parse config file \'' + 
      filename + '\': ' + e.message);
    
    throw e;
  }
}

function createConnectionManager(options) {
  
  var config = loadConfigFile(options.config);
  
  var failover = new stompit.ConnectFailover(
    config.servers, 
    config.failover
  );
  
  failover.on('error', function(error, server) {
    
    println(util.format(
      'Unable to connect to \'%s\': %s', 
       utils.formatServerAddress(server), 
       error.message
    ));
  });
  
  failover.on('connect', function(server) {
    
    println(util.format(
      'Connected to %s', formatServerAddress(server)
    ));
  });
  
  return failover;
}

function createChannel(options) {
  
  var connectionManager = createConnectionManager(options);
  
  return new stompit.Channel(connectionManager);
}

function formatServerAddress(server) {
  var remoteAddress = server.serverProperties.remoteAddress;
  return util.format('%s:%s', remoteAddress.host, remoteAddress.port);
}

module.exports = {
  loadCommandOptions: loadCommandOptions,
  loadConfigFile: loadConfigFile,
  createConnectionManager: createConnectionManager,
  createChannel: createChannel
};
