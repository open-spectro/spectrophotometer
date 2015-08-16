var SerialConnection = function(options) {
  var options=options || {};
  this.connectionId = -1;
  this.lineBuffer = "";
  this.fullBuffer = "";
  this.message = "";
  this.boundOnReceive = this.onReceive.bind(this);
  this.boundOnReceiveError = this.onReceiveError.bind(this);
  this.onEvent = new chrome.Event();
  this.receivingTimeout = 5000;
  this.sendTime; // receiving data till it contains a double CR LF
  this.messageID;
  this.defaultDevicePath;
  this.deviceMatchRegexp=options.deviceMatchRegexp;
};

SerialConnection.prototype.serial = chrome.serial;

SerialConnection.prototype.setDevice = function(devicePath) {
  this.defaultDevicePath=devicePath;
  chrome.storage.local.set({'defaultDevicePath': this.defaultDevicePath}, function() {
    // Notify that we saved.
    this.infoMessage('Default device saved', this.defaultDevicePath);
  });
}

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

/*
TODO
When sending data we will try to connect if there are no connection
or the connection fails

In order to connect we need:
- read the local defaultDevice :  chrome.storage.local.get
- try to connect based on defaultPath
- if failed, try to find a device based on the matchRegexp and if one
- connect the device

 */

SerialConnection.prototype.connect = function(path) {
  this.serial.connect(path, {
    bitrate: 115200
  }, this.onConnectComplete.bind(this))
};

SerialConnection.prototype.getDevice = function(deviceMatchRegexp, callback) {
    this.serial.getDevices(
        function (devices) {
          var matchDevices=[];
          for (var i=0; i<devices.length; i++) {
            if (devices[i].path.match(deviceMatchRegexp)) {
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

SerialConnection.prototype.devices = function() {
  var self=this;
  this.serial.getDevices(
    function (devices) {
      self.successMessage("Devices",devices);
    }
  );
}

SerialConnection.prototype.send = function(D) {
  if (this.connectionId < 0) {
    // TODO we should try to connect and resend
    this.errorMessage('Invalid connection');
  }
  var self=this;
  this.serial.send(this.connectionId, this.str2ab(this.message+"\r"), function(result) {
    self.infoMessage("Send result of bytes sent",result.bytesSent);
    // TODO it could be an error in result.error
    // In this case we could disconnect and try to connect again once
  });
};


SerialConnection.prototype.disconnect = function() {
  if (this.connectionId < 0) {
    this.infoMessage('Trying to close invalid connection: '+this.connectionId);
  } else {
    this.serial.disconnect(this.connectionId, function() {});
    this.connectionId=-1;
  }
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
  this.messageID=data.messageID;
  this.message=data.message;

  switch (data.action) {
    case "serial.send":
      this.send();
      break;
    case "serial.devices":
      this.devices();
      break;
    case "serial.setDevice":
      this.setDevice(this.message);
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
    'messageID': this.messageID,
    'message' : message,
    'command' : this.message,
    'data': data
  });
}

SerialConnection.prototype.errorMessage = function(message, data) {
  this.onEvent.dispatch({
    'status': 'error',
    'messageID': this.messageID,
    'message' : message,
    'command' : this.message,
    'data': data
  });
}

SerialConnection.prototype.successMessage = function(message, data) {
  this.onEvent.dispatch({
    'status': 'success',
    'messageID': this.messageID,
    'message' : message,
    'command' : this.message,
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

