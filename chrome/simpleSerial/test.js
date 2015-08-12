var c;

function showReceiveResult(result) {
    c=result;
    console.log("RECEIVE Result")

    if (result.data) {
        console.log(ab2str(result.data));
    }
}


// TODO need to add for windows and linux computer ...
var matchRegexp=/tty.usbmodem/;



function getSpectroDevice(devices) {
    var matchDevices=[];
    for (var i=0; i<devices.length; i++) {
        if (devices[i].path.match(matchRegexp)) {
            matchDevices.push(devices[i].path)
        }
    }
    if (matchDevices.length===0) {
        throw new Error('No spectrophotometer found !');
    } else if (matchDevices.length>1) {
        throw new Error('More than one device found !');
    } else {
        console.log(matchDevices[0]);
        return matchDevices[0];
    }
}


function request(action, callback) {
    chrome.serial.getDevices(getSpectroDevice);

}


function printResult(result) {
    console.log(result);
}


request('h', printResult);




function connect(path, callback) {
    var options={
        bitrate:9600
    };
    chrome.serial.connect(path, options, callback);
}


function showSendCommandResult(result) {
    console.log("SEND COMMAND RESULT:")
    console.log(result);
}


function connected(connection) {
    console.log("Activate onReceive for connection: ",connection);
    var connectionId=connection.connectionId;
    console.log("connectionId:",connectionId);
    chrome.serial.setControlSignals(connectionId, { dtr: false, rts: false }, printResult);

    chrome.serial.onReceive.addListener(showReceiveResult)
    chrome.serial.onReceiveError.addListener(showReceiveResult)
    sendCommand(connectionId);

}

var ab2str = function(buf) {
    var bufView = new Uint8Array(buf);
    return String.fromCharCode.apply(null, bufView);
};

function sendCommand(connectionId) {

    window.setTimeout(function() {

        chrome.serial.getControlSignals(connectionId,printResult);

        var command=getArrayBuffer('h\r\n');
        console.log(connectionId, command);
        chrome.serial.send(connectionId, command, showSendCommandResult);
    },1000)
}



connect("/dev/tty.usbmodem1421", connected);


function getArrayBuffer(string) {
    var array=new Uint8Array(string.length);
    for (var i=0; i<string.length; i++) {
        console.log(string.charCodeAt(i));
        array[i]=string.charCodeAt(i);
    }
    console.log(array);
    console.log(array.buffer.byteLength);
    return array.buffer;
}