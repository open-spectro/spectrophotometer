console.log("In iframe");

var messages={};
var messageID=0;


function postMessage(action, data, callback) {
    console.log("POST MESSAGE");
    messageID++;
    window.parent.postMessage(
        {
            action: action,
            messageID:messageID,
            message: data
        }, "*"
    );
    messages[messageID]={
        action:action,
        messageID:messageID,
        message: data,
        callback: callback
    }
}

var result=document.getElementById('result');
function logResult(event) {
    console.log(event.data);
    result.innerHTML="Event received in call back\r\n";
    console.log("CALLBACK");
    console.log(JSON.stringify(event.data,{},3))
    result.innerHTML+=JSON.stringify(event.data,{},3)+"\r\n";
    result.innerHTML+="---------------\r\b";
    result.innerHTML+=event.data.data;
    result.innerHTML+="---------------\r\n";
}


window.addEventListener("message", receiveMessage, false);
function receiveMessage(event) {
    console.log("RECEIVE event in IFRAME")
    console.log(event.data);
    var messageID=event.data.messageID;
    if (messages[messageID] && messages[messageID].callback) {
        console.log("In call back");
        messages[messageID].callback(event);
        delete messages[messageID];
    } else {

    }
}

// Attach events to the buttons
var nodes=document.querySelectorAll('button');
for (var i=0; i<nodes.length; i++) {
    nodes[i].addEventListener('click', function() {
        var message=this.innerHTML;
        if (message==='Send') {
            message=document.getElementById('command').value;
            console.log(message);
        }
        postMessage("send", message+'\r\n', logResult);
        buffer.innerHTML='Instruction: '+this.innerHTML+' sent.<br><br>';
    });
}

