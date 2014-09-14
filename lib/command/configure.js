
var inquirer = require('inquirer');
var yaml = require('js-yaml');
var fs = require('fs');
var color = require('cli-color');

function init(nomnom) {
  
  var outputOption = {
    abbr: 'o',
    help: 'filename of output config file',
    default: '.stomp_config.yml'
  };
  
  nomnom.command('configure')
    .option('output', outputOption)
    .callback(configure);
}

function configure(options) {
  
  var outputFilename = options.output;
  
  if (fs.existsSync(outputFilename)) {
    
    process.stdout.write(color.yellow(
      'This command will overwrite the existing config file!\n'
    ));
  }
  
  promptServerSettings(function(servers) {
    promptFailoverSettings(function(failover) {
      
      var config = {
        servers: servers,
        failover: failover
      };
      
      fs.writeFileSync(options.output, yaml.dump(config), {
        mode: 0664,
        flag: 'w'
      });
      
      process.stdout.write(color.green(
        'Success: Written config file ' + outputFilename + '\n'
      ));
    });
  });
}

function promptServerSettings(callback) {
  
  process.stdout.write('Server connection settings:\n');
  
  var answersCollection = [];
  
  var questions = [
    
    {
      name: 'host',
      message: 'Host',
      default: 'localhost'
    },
    
    {
      name: 'port',
      message: 'Port',
      default: 61613
    },
    
    {
      type: 'confirm',
      name: 'ssl',
      message: 'Use ssl/tls protocol',
      default: false
    },
    
    {
      type: 'input',
      name: 'ca',
      message: 'Path of file containing trusted certificates in PEM format',
      when: function(answers){
        return answers.ssl;
      }
    },
    
    {
      name: 'broker',
      message: 'Broker/vhost name'
    },
    
    {
      name: 'login',
      message: 'Login username',
    },
    
    {
      name: 'passcode',
      message: 'Login password'
    },
    
    {
      type: 'confirm',
      name: 'repeatQuestions',
      message: 'Add another server?',
      default: false
    }
  ];
  
  var processAnswers = function(answers) {
    
    delete answers['repeatQuestions'];
    
    var connectHeaders = {
      'host': answers.broker,
      'login': answers.login,
      'passcode': answers.passcode
    };
    
    delete answers['broker'];
    delete answers['login'];
    delete answers['passcode'];
    
    answers['connectHeaders'] = connectHeaders;
    
    answersCollection.push(answers);
    
    if (answers.repeatQuestions) {
      inquirer.prompt(questions, processAnswers);
    }
    else {
      callback(answersCollection);
    }
  };
  
  inquirer.prompt(questions, processAnswers);
}

function promptFailoverSettings(callback) {
  
  process.stdout.write('Failover settings:\n');
  
  var confirmReconnects = function(answers){
    return answers.reconnect;
  };
  
  var questions = [
    
    {
      type: 'confirm',
      name: 'reconnect',
      message: 'Reconnect to server on connection failure',
      default: true
    },
    
    {
      name: 'maxReconnects',
      message: 'Limit number of failed connection attempts (-1 for no limit)',
      default: -1,
      when: confirmReconnects
    },
    
    {
      name: 'initialReconnectDelay',
      message: 'Milliseconds delay of the first reconnect',
      default: 10,
      when: confirmReconnects
    },
    
    {
      name: 'maxReconnectDelay',
      message: 'Maximum reconnect delay milliseconds',
      default: 30000,
      when: confirmReconnects
    },
    
    {
      type: 'confirm',
      name: 'useExponentialBackOff',
      message: 'Exponential increase of reconnect delay',
      default: true,
      when: confirmReconnects
    },
    
    {
      type: 'confirm',
      name: 'randomize',
      message: 'Randomly choose an alternative server on reconnect',
      default: true
    }
    
  ];
  
  var processAnswers = function(answers) {
    callback(answers);
  };
  
  inquirer.prompt(questions, processAnswers);
}

module.exports = {
  init: init
};
