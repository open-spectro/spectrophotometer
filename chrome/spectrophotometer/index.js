var matchRegexp = /tty.usbmodem/;

var connection = new SerialConnection();
var iframeWindow=document.getElementById('iframe').contentWindow;

connection.getDevice(matchRegexp, function(path) {
    connection.connect(path);
});

connection.onReceiveCompleted.addListener(function(message) {
    console.log(message);
    iframeWindow.postMessage(message, "*");
});

connection.onConnect.addListener(function() {
    log('connected');
});

connection.onReadLine.addListener(function(line) {
    log('read line: ' + line);
});


function log(message) {
    iframeWindow.postMessage({
        status: 'ok',
        message: message
    }, "*");
}




window.addEventListener("message", receiveMessage, false);

function receiveMessage(event) {
    console.log("event received in the WINDOW");
    var data = event.data;
    console.log("------------------")
    console.log(data);
    switch (data.action) {
        case "send":
            connection.send(data.message + '\r\n', data.messageID);
            break;
    }
}

