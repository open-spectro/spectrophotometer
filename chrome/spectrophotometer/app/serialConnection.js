
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

  this.serial.onReceive.addListener(this.boundOnReceive);
  this.serial.onReceiveError.addListener(this.boundOnReceiveError);
};

SerialConnection.prototype.serial = chrome.serial;

SerialConnection.prototype.setDevice = function(devicePath) {
  this.defaultDevicePath=devicePath;
  chrome.storage.local.set({'defaultDevicePath': this.defaultDevicePath}, function() {
    // Notify that we saved.
    this.sendMessage('info','Default device saved', this.defaultDevicePath);
  });
}




SerialConnection.prototype.onReceive = function(receiveInfo) {
  if (receiveInfo.connectionId !== this.connectionId) {
    return;
  }

  this.lineBuffer += this.ab2str(receiveInfo.data);
  this.fullBuffer += this.ab2str(receiveInfo.data);

  var index;
  while ((index = this.lineBuffer.indexOf('\n')) >= 0) {
    var line = this.lineBuffer.substr(0, index + 1);
    this.sendMessage('info','line received',line);
    this.lineBuffer = this.lineBuffer.substr(index + 1);
  }

  if (this.fullBuffer.match(/(\r\n?\r\n?|\n\n)/)) {
    this.sendMessage('success','receive completed', this.fullBuffer)
    this.sendTime = null;
    this.lineBuffer = "";
    this.fullBuffer = "";
  }
};

SerialConnection.prototype.onReceiveError = function(errorInfo) {
  if (errorInfo.connectionId === this.connectionId) {
    sendMessage('error',errorInfo.error);
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

SerialConnection.prototype.connect = function(path, options) {
  var self=this;
  return new Promise(function(resolve, reject) {
    var options = options || {};
    options.bitrate = options.bitrate || 115200;
    self.serial.connect(path, options,function(connectionInfo) {
      if (!connectionInfo) {
        self.sendMessage('error',"Connection failed.");
        reject();
      } else {
        self.connectionId = connectionInfo.connectionId;
        self.sendMessage('success','Connection successful.');
        resolve();
      }
    });
  });
};

SerialConnection.prototype.getDevice = function(deviceMatchRegexp, callback) {
  var self=this;
  return new Promise(function(resolve, reject) {
    self.serial.getDevices(
      function (devices) {
        var matchDevices=[];
        for (var i=0; i<devices.length; i++) {
          if (devices[i].path.match(deviceMatchRegexp)) {
            matchDevices.push(devices[i].path)
          }
        }
        if (matchDevices.length===0) {
          self.sendMessage('error','No spectrophotometer found !');
          reject('No spectrophotometer found !');
        } else if (matchDevices.length>1) {
          self.sendMessage('error','More than one device found !');
          reject('More than one device found !');
        } else {
          resolve(matchDevices[0]);
        }
      }
    );
  })

}

SerialConnection.prototype.devices = function() {
  var self=this;
  this.serial.getDevices(
    function (devices) {
      self.sendMessage('success',"Devices",devices);
    }
  );
}

SerialConnection.prototype.send = function() {
  var self=this;
  return new Promise(function(resolve, reject) {
    if (self.connectionId < 0) {
      // TODO we should try to connect and resend
      self.sendMessage('error','Invalid connection');
      reject('Invalid connection');
    } else {
      self.serial.send(self.connectionId, self.str2ab(self.message+"\r"), function(sendInfo) {
        if (sendInfo.error) {
          reject(sendInfo.error);
          self.sendMessage('error',"Send result of bytes sent",sendInfo.bytesSent);
        } else {
          resolve(sendInfo.bytesSent);
          self.sendMessage('info',"Send result of bytes sent",sendInfo.bytesSent);
        }
      });
    }
  });
};


SerialConnection.prototype.disconnect = function() {
  var self=this;
  return new Promise(function(resolve, reject) {
    if (self.connectionId < 0) {
      self.sendMessage('info','Trying to close invalid connection: '+self.connectionId);
    } else {
      self.serial.disconnect(this.connectionId, function() {});
      self.connectionId=-1;
    }
  });
};

SerialConnection.prototype.dispatch = function(data) {
  // are we allowed to send an instrucdtion ?
  if (this.sendTime) {
    if ((this.now()-this.sendTime)<this.receivingTimeout) {
      // need still to wait for previous command
      this.onReceiveCompleted.dispatch(
          this.sendMessage('error',
              'Previous command not yet finished, timeout in: '+(this.now()-this.sendTime)+'ms',
              this.fullBuffer
          )
      );
    } else {
      this.sendMessage('info',
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
      this.sendMessage('error',data.messageID, 'action "'+data.action+'" not implemented', data);
  }
}


//////////////////////////////////////
/////////// Message functions

SerialConnection.prototype.sendMessage = function(type, message, data) {
  var self=this;
  this.onEvent.dispatch(
      self.getMessage(type, message, data)
  );
}

SerialConnection.prototype.getMessage = function(type, message, data) {
  return {
    'status': type,
    'messageID': this.messageID,
    'message' : message,
    'command' : this.message,
    'data': data
  };
};


//////////////////////////////////////
/////////// Utility functions

SerialConnection.prototype.now = function () {
  return (new Date).getTime();
};

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

