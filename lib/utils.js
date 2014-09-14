
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

module.exports = {
  parseHeaderLines: parseHeaderLines,
  format: util.format
};
