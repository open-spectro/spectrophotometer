

console.log("In iframe");

var events={};
var result=document.getElementById('result');
var eventID=0;


function postMessage(action, data, callback) {
    console.log("POST MESSAGE");
    eventID++;
    window.parent.postMessage(
        {
            action: action,
            eventID:eventID,
            data: data
        }, "*"
    );
    events[eventID]={
        action:'listUSBDevices',
        eventID:eventID,
        data: data,
        callback: callback
    }
}

function logResult(event) {
    console.log(event.data);
    result.innerHTML+="Event received in call back\r\n";
    console.log("CALLBACK");
    console.log(JSON.stringify(event.data,{},3))
    result.innerHTML+=JSON.stringify(event.data,{},3);
}

postMessage("listUSBDevices", {}, logResult);

window.addEventListener("message", receiveMessage, false);

function receiveMessage(event) {
    console.log("RECEIVE event in IFRAME")
    console.log(event);
    var eventID=event.data.eventID;
    if (events[eventID] && events[eventID].callback) {
        console.log("In call back");
        events[eventID].callback(event);
        delete events[eventID];
    } else {
        result.innerHTML+="Event received";
        result.innerHTML+=receiveMessage;
    }

}



