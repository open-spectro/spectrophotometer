var SerialConnection = function() {
  this.connectionId = -1;
  this.lineBuffer = "";
  this.fullBuffer = "";
  this.sendCommand = "";
  this.boundOnReceive = this.onReceive.bind(this);
  this.boundOnReceiveError = this.onReceiveError.bind(this);
  this.onEvent = new chrome.Event();
  this.receivingTimeout = 5000;
  this.sendTime; // receiving data till it contains a double CR LF
  this.sendMessageID;
};

SerialConnection.prototype.serial = chrome.serial;


SerialConnection.prototype.onConnectComplete = function(connectionInfo) {
  if (!connectionInfo) {
    this.onEvent.dispatch(this.errorMessage("Connection failed."));
    return;
  }
  this.connectionId = connectionInfo.connectionId;
  this.serial.onReceive.addListener(this.boundOnReceive);
  this.serial.onReceiveError.addListener(this.boundOnReceiveError);
  this.successMessage('Connection successful.');
};


SerialConnection.prototype.onReceive = function(receiveInfo) {
  if (receiveInfo.connectionId !== this.connectionId) {
    return;
  }

  this.lineBuffer += this.ab2str(receiveInfo.data);
  this.fullBuffer += this.ab2str(receiveInfo.data);

  var index;
  while ((index = this.lineBuffer.indexOf('\n')) >= 0) {
    var line = this.lineBuffer.substr(0, index + 1);
    this.infoMessage('line received',line);
    this.lineBuffer = this.lineBuffer.substr(index + 1);
  }

  if (this.fullBuffer.match(/(\r\n?\r\n?|\n\n)/)) {
    this.successMessage('receive completed', this.fullBuffer)
    this.sendTime = null;
    this.lineBuffer = "";
    this.fullBuffer = "";
  }
};

SerialConnection.prototype.onReceiveError = function(errorInfo) {
  if (errorInfo.connectionId === this.connectionId) {
    errorMessage(errorInfo.error);
  }
};

SerialConnection.prototype.connect = function(path) {
  this.serial.connect(path, {
    bitrate: 115200
  }, this.onConnectComplete.bind(this))
};

SerialConnection.prototype.getDevice = function(matchRegexp, callback) {
    this.serial.getDevices(
        function (devices) {
          var matchDevices=[];
          for (var i=0; i<devices.length; i++) {
            if (devices[i].path.match(matchRegexp)) {
              matchDevices.push(devices[i].path)
            }
          }
          if (matchDevices.length===0) {
            errorMessage('No spectrophotometer found !');
          } else if (matchDevices.length>1) {
            errorMessage('More than one device found !');
          } else {
            callback(matchDevices[0]);
          }
        }
    );
}

SerialConnection.prototype.send = function(msg, sendMessageID) {
  if (this.connectionId < 0) {
    this.errorMessage('Invalid connection');
  }
  this.serial.send(this.connectionId, this.str2ab(msg), function() {});
};


SerialConnection.prototype.disconnect = function() {
  if (this.connectionId < 0) {
    throw 'Invalid connection';
  }
  this.serial.disconnect(this.connectionId, function() {});
};

SerialConnection.prototype.dispatch = function(data) {
  // are we allowed to send an instrucdtion ?
  if (this.sendTime) {
    if ((this.now()-this.sendTime)<this.receivingTimeout) {
      // need still to wait for previous command
      this.onReceiveCompleted.dispatch(
          this.errorMessage(
              'Previous command not yet finished, timeout in: '+(this.now()-this.sendTime)+'ms',
              this.fullBuffer
          )
      );
    } else {
      this.infoMessage(
          "Previous command was cancelled"
      )
    }
  }
  this.sendTime=this.now();
  this.sendMessageID=data.messageID;
  this.sendCommand=data.command;


  switch (data.action) {
    case "serial.send":
      this.send(data.message + '\r\n', data.messageID);
      break;
    case "serial.devices":
      this.devices(data.message + '\r\n', data.messageID);
      break;
    default:
      this.errorMessage(data.messageID, 'action "'+data.action+'" not implemented', data);
  }
}


//////////////////////////////////////
/////////// Message functions

SerialConnection.prototype.infoMessage = function(message, data) {
  this.onEvent.dispatch({
    'status': 'info',
    'messageID': this.sendMessageID,
    'message' : message,
    'command' : this.sendCommand,
    'data': data
  });
}

SerialConnection.prototype.errorMessage = function(message, data) {
  this.onEvent.dispatch({
    'status': 'error',
    'messageID': this.sendMessageID,
    'message' : message,
    'command' : this.sendCommand,
    'data': data
  });
}

SerialConnection.prototype.successMessage = function(message, data) {
  this.onEvent.dispatch({
    'status': 'success',
    'messageID': this.sendMessageID,
    'message' : message,
    'command' : this.sendCommand,
    'data': data
  });
}


//////////////////////////////////////
/////////// Utility functions

SerialConnection.prototype.now = function () {
  return (new Date).getTime();
}

/* Interprets an ArrayBuffer as UTF-8 encoded string data. */
SerialConnection.prototype.ab2str = function(buf) {
  var bufView = new Uint8Array(buf);
  return String.fromCharCode.apply(null, bufView);
};

/* Converts a string to UTF-8 encoding in a Uint8Array; returns the array buffer. */
SerialConnection.prototype.str2ab = function(str) {
  var bytes = new Uint8Array(str.length);
  for (var i = 0; i < str.length; ++i) {
    bytes[i] = str.charCodeAt(i);
  }
  return bytes.buffer;
};

