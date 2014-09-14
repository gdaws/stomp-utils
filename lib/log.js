
function status(message) {
  process.stdout.write(message + '\n');
}

function error(message) {
  process.stderr.write(message + '\n');
}

module.exports = {
  status: status,
  error: error
};
