var matchRegexp = /(tty.usbmodem|ttyASM)/;

var connection = new SerialConnection();
var webviewWindow;


connection.onEvent.addListener(function(message) {
    if (! webviewWindow) return;
    webviewWindow.postMessage(message, "*");
});

connection.getDevice(matchRegexp, function(path) {
    connection.connect(path);
});



document.getElementById('webview').addEventListener("contentload", function () {
    console.log("Content loaded");
    try{
        webviewWindow=webview.contentWindow;
        webviewWindow.postMessage("Message from Chrome APP!", "*");
    }catch(error){
        console.log("postMessage error: " + error);
    }

});




function errorMessage(messageID, message, data) {
    webviewWindow.postMessage({
        'status': 'error',
        'messageID': messageID,
        'message' : message,
        'data': data
    }, "*");
}



window.addEventListener("message", receiveMessage, false);

function receiveMessage(event) {
    var data = event.data;
    switch (data.action) {
        case "serial.send":
            connection.send(data.message + '\r\n', data.messageID);
            break;
        case "serial.devices":
            connection.devices(data.message + '\r\n', data.messageID);
            break;
        default:
            errorMessage(data.messageID, 'action "'+data.action+'" not implemented', data);
    }
}
