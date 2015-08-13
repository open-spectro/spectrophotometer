

window.setTimeout(function() {
    console.log(document.getElementById('iframe'));
    console.log(document.getElementById('iframe').contentWindow);
},1000)


var iframeWindow=document.getElementById('iframe').contentWindow;
var parentWindow=window.parent;

console.log("In wrap");




window.addEventListener("message", receiveMessage, false);

function receiveMessage(event)
{
    if (event.source===iframeWindow) {
        console.log("From iframe");
        parentWindow.postMessage(event.data, "*");
    }
    if (event.source===parentWindow) {
        console.log("From parent");
        iframeWindow.postMessage(event.data, "*");
    }
    console.log("event reveived in the WRAP");
    console.log(event);
// we need to dispatch the event depending where it is coming from
    // window.parent.postMessage("USBList", "*");



}

