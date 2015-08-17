var deviceMatchRegexp = /(tty.usbmodem|ttyASM)/;

var connection = new SerialConnection({deviceMatchRegexp:deviceMatchRegexp});

var webviewWindow;


connection.onEvent.addListener(function(message) {
    if (! webviewWindow) return;
    webviewWindow.postMessage(message, "*");
});


// we need to inject in the webview the current page so that we can
// communicate with it
document.getElementById('webview').addEventListener("contentload", function () {
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
    if (! data.action) {
        console.log("Unspecified action: ",event);
        return;
    }
    var actionType=data.action.replace(/\..*/,"")
    switch (actionType) {
        case "serial":
            connection.dispatch(data);
            break;
        case "file":
            // TODO access to filesystem
            break;
        default:
            errorMessage(data.messageID, 'action "'+actionType+'" not implemented', data);
    }
}
