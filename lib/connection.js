var yaml = require('js-yaml');
var fs = require('fs');
var path = require('path');
var format = require('util').format;
var log = require('./log');
var stompit = require('stompit');

function loadCommandOptions(command) {
  
  command.option('config', {
    abbr: 'c',
    help: 'filename of config file',
    default: '.stomp_config.yml'
  });
  
  command.option('inline-config', {
    help: 'load config from failover uri'
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
    
    log.error('Failed to find config file \'' + filename + '\'');
    
    throw new Error('file not found \'' + filename + '\'');
  }
  
  try {
    var data = fs.readFileSync(resolvedFilename, 'utf8');
  }
  catch(e) {
    
    log.error('Failed to load config file \'' + filename + '\': ' + e.message);
    
    throw e;
  }
  
  try {
    return yaml.safeLoad(data);
  }
  catch(e) {
    
    log.error('Failed to parse config file \'' + filename + '\': ' + e.message);
    
    throw e;
  }
}

function createConnectionManager(options) {
  
  var failover;
  
  if ('inline-config' in options){
    
    failover = new stompit.ConnectFailover(options['inline-config']);
  }
  else {
    
    var config = loadConfigFile(options.config);
    
    failover = new stompit.ConnectFailover(
      config.servers, 
      config.failover
    );
  }
  
  failover.on('error', function(error, server) {
    
    log.error(format('Unable to connect to \'%s\': %s', 
      formatServerAddress(server), 
      error.message
    ));
  });
  
  failover.on('connect', function(server) {
    
    log.status(format('Connected to %s', formatServerAddress(server)));
  });
  
  return failover;
}

function createChannel(options) {
  
  var connectionManager = createConnectionManager(options);
  
  return new stompit.Channel(connectionManager);
}

function formatServerAddress(server) {
  var remoteAddress = server.serverProperties.remoteAddress;
  return format('%s:%s', remoteAddress.host, remoteAddress.port);
}

module.exports = {
  loadCommandOptions: loadCommandOptions,
  loadConfigFile: loadConfigFile,
  createConnectionManager: createConnectionManager,
  createChannel: createChannel
};
