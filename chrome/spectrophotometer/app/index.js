var matchRegexp = /tty.usbmodem/;

var connection = new SerialConnection();
var webviewWindow;

connection.getDevice(matchRegexp, function(path) {
    connection.connect(path);
});

connection.onReceiveCompleted.addListener(function(message) {
    console.log(message);
    webviewWindow.postMessage(message, "*");
});

connection.onConnect.addListener(function() {
    if (webviewWindow) {
        log('connected');
    } else {
        console.log('connected');
    }
});

connection.onReadLine.addListener(function(line) {
    if (webviewWindow) {
        log('read line: ' + line);
    } else {
        console.log('read line: ' + line);
    }
});


document.getElementById('webview').addEventListener("contentload", function () {
    console.log("Content loaded");
    try{
        webviewWindow=webview.contentWindow;
        console.log(webviewWindow);
        console.log("Trying to post message");
        webviewWindow.postMessage("Message from Chrome APP!", "*");
    }catch(error){
        console.log("postMessage error: " + error);
    }

});


function log(message) {
    webviewWindow.postMessage({
        status: 'ok',
        message: message
    }, "*");
}


window.addEventListener("message", receiveMessage, false);

function receiveMessage(event) {
    console.log("Main window received a message:");
    var data = event.data;
    console.log(data);
    switch (data.action) {
        case "send":
            connection.send(data.message + '\r\n', data.messageID);
            break;
    }
}
