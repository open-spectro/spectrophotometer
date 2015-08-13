var matchRegexp = /tty.usbmodem/;
var buffer = document.querySelector('#buffer');

var connection = new SerialConnection();

connection.getDevice(matchRegexp, function(path) {
  connection.connect(path);
});

connection.onReceiveCompleted.addListener(function(message) {
  console.log(message);
  /*
  var buffer = document.querySelector('#buffer');
  buffer.innerHTML += msg + '<br/>';
  */
});

connection.onConnect.addListener(function() {
  log('connected');
});

connection.onReadLine.addListener(function(line) {
  log('read line: ' + line);
});


function log(msg) {
  buffer.innerHTML += msg + '<br/>';
}


var messageID=0;

var nodes=document.querySelectorAll('button');
for (var i=0; i<nodes.length; i++) {
  nodes[i].addEventListener('click', function() {
    var message=this.innerHTML;
    if (message==='Send') {
      message=document.getElementById('command').value;
      console.log(message);
    }
    connection.send(message+'\r\n', messageID++);
    buffer.innerHTML='Instruction: '+this.innerHTML+' sent.<br><br>';
  });
}

