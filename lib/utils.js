
var clc = require('cli-color');
var fs = require('fs');

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

module.exports = {
  parseHeaderLines: parseHeaderLines,
  println: println
};
