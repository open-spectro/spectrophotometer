var iframeWindow=document.getElementById('iframe').contentWindow;


function sendUSBDevices(event) {
    chrome.usb.getDevices({}, function(devices) {
        sendResult(event, devices);
    });
}

function sendResult(event, data) {
    console.log("Sending event from WINDOW");
    console.log(event, data);
    iframeWindow.postMessage({
        eventID:event.data.eventID,
        data: data
    }, "*");
}

window.addEventListener("message", receiveMessage, false);

function receiveMessage(event)
{
    console.log("event received in the WINDOW");
    switch (event.data.action) {
        case "listUSBDevices":
            sendUSBDevices(event);
            break;

    }


}

