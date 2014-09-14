
var clc = require('cli-color');
var yaml = require('js-yaml');
var fs = require('fs');
var path = require('path');
var util = require('util');

function parseHeaderLines() {

  var headers = {};
  
  var headerPattern = /([^:]+):(.*)/;
  
  for (var i = 0; i < arguments.length; i++) {
    
    var arg = arguments[i];
    
    if (!(arg instanceof Array)) {
      arg = [arg];
    }
    
    for (var j = 0; j < arg.length; j++) {
      
      var lines = ("" + arg[j]).split("\n");
      
      for (var k = 0; k < lines.length; k++) {
        
        var line = lines[k];
        
        var match = line.match(headerPattern);
        
        if (match) {
          headers[match[1]] = match[2];
        }
      }
    }
  }
  
  return headers;
};

function println(output) {
  
  var filters = {
    'Error': clc.red.bold,
    'Warning': clc.yellow,
    'Success': clc.green,
    'Notice': clc.blue
  };
  
  var match = output.match(/^([^:]+):[ ]*(.*)/);
  if (match) {
    var filterName = match[1];
    var message = match[2]; 
    if (filters.hasOwnProperty(filterName)) {
      output = filters[filterName](message);
    }
  }
  
  return process.stdout.write(output + '\n');
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

function formatServerAddress(server) {
  var remoteAddress = server.serverProperties.remoteAddress;
  return util.format('%s:%s', remoteAddress.host, remoteAddress.port);
}

module.exports = {
  parseHeaderLines: parseHeaderLines,
  println: println,
  loadConfigFile: loadConfigFile,
  formatServerAddress: formatServerAddress,
  format: util.format
};
