

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

  this.localStorage=new LocalStorage();

  var self=this;
  this.localStorage.get('defaultDevicePath').then(
      function(result) {
        self.defaultDevicePath=result.defaultDevicePath;
      }
  )


};

SerialConnection.prototype.serial = chrome.serial;

SerialConnection.prototype.setDefaultDevicePath = function(devicePath) {
  var self=this;
  this.defaultDevicePath=devicePath;
  return new Promise(function(resolve, reject) {
    self.localStorage.set('defaultDevicePath',self.defaultDevicePath).then(
      function(result) {
        self.sendMessage('info','Default device saved', devicePath);
      }).then(resolve, reject);
  })
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
    this.sendMessage('error',errorInfo.error);
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
    if (! path) {
      reject(self.getMessage('error',"Trying to open a serial connection for unspecified path"));
      return;
    }
    options.bitrate = options.bitrate || 115200;
    self.serial.connect(path, options,function(connectionInfo) {
      if (!connectionInfo) {
        reject(self.getMessage('error',"Connection failed."));
      } else {
        self.connectionId = connectionInfo.connectionId;
        resolve(self.getMessage('success','Connection successful.', connectionInfo));
      }
    });
  });
};

SerialConnection.prototype.bestConnect = function(options) {
  var self=this;
  return new Promise(function(resolve, reject) {
    // is there a default device ????
    console.log("Trying using defaultDevicePath: "+self.defaultDevicePath);
    self.connect(self.defaultDevicePath, options).catch( // no way to open the default device
        function(result) {
          // we try to get a device based on regexp
          console.log("Trying to get the device based on the regexp: "+this.deviceMatchRegexp);
          return self.getDevice().then(function(result) {
            self.sendMessage('info', 'Found a device from regexp: '+result);
            return self.connect(result, options);
          });

        }
    ).then(function(result) { // we have a conneciton !
          console.log('We got a connection !')
          resolve();
        }, function(error) { // still no connection :( we give up ...
          console.log('no way to get a conneciton ...')
          reject();
        })
  });
};


SerialConnection.prototype.getDevice = function() {
  var self=this;
  return new Promise(function(resolve, reject) {
    self.serial.getDevices(
      function (devices) {
        var matchDevices=[];
        for (var i=0; i<devices.length; i++) {
          if (devices[i].path.match(self.deviceMatchRegexp)) {
            matchDevices.push(devices[i].path)
          }
        }
        if (matchDevices.length===0) {
          reject(self.getMessage('error','No serial path found !'));
        } else if (matchDevices.length>1) {
          reject(self.getMessage('error','More than one serial device found !'));
        } else {
          resolve(matchDevices[0]);
        }
      }
    );
  })

}

SerialConnection.prototype.getDevices = function() {
  var self=this;
  return new Promise(function(resolve, reject) {
    self.serial.getDevices(
        function (devices) {
          resolve(self.getMessage('success',"Devices",devices))
        }
    );
  })
}

SerialConnection.prototype.send = function() {
  var self=this;
  return new Promise(function(resolve, reject) {
    if (self.connectionId < 0) {
      reject(self.getMessage('error','Invalid connection'));
    } else {
      console.log("We will send the message to serial port: "+self.message);
      self.serial.send(self.connectionId, self.str2ab(self.message+"\r"), function(sendInfo) {
        if (sendInfo.error) {
          reject(self.getMessage('error','Send error', sendInfo.error));
        } else {
          resolve();
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
      resolve();
    } else {
      self.serial.disconnect(self.connectionId, function() {
        self.connectionId=-1;
        resolve();
      });
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

  var self=this;

  switch (data.action) {
    case "serial.send":
      console.log("We want to send a message");
        /*
        1. try to send the command
        2. if failed:  try to open default device
        3. if failed:  try to find a good device (based on regexp)
        4. try to send the command
         */
      this.send().catch(
          function(error) { // could not send ... we will try to reopen the connection
            self.sendMessage('warn', 'Could not send the message');
            return self.bestConnect({}).then(
                function(result) {
                   return self.send();
                }
            )
          }
      ).then(function(result) {
            self.sendMessage('info', 'Could send the message to USB device');
          },
          function(error) {
            self.sendMessage('error', 'Didn\'t succeed to connect to the usb device');
            self.sendTime = null;
          }
      );
      break;
    case "serial.getDevices":
        console.log("Getting devices list")
      this.getDevices().then(
          function(result) {
            self.sendMessage(result);
            self.sendTime = null;
          }
      );
      break;
    case "serial.setDefaultDevicePath":
        this.disconnect().catch().then(function(result) {
          self.connectionId=null;
        }).then(function(result) {
          return self.setDefaultDevicePath(self.message);
        }).then(
          function(result) {
            self.sendMessage('success','Default device saved', result);
            self.sendTime = null;
          },
          function(error) {
            self.sendMessage('error','Failed to setDevice', error);
            self.sendTime = null;
          }
      );
      break;
    default:
      this.sendMessage('error','action "'+data.action+'" not implemented', data);
  }
}


//////////////////////////////////////
/////////// Message functions

SerialConnection.prototype.sendMessage = function(type, message, data) {
  var self=this;

  if (typeof type === 'object') { // it is already a well formed message, no need to construct it
    this.onEvent.dispatch(type);
  } else {
    this.onEvent.dispatch(
        self.getMessage(type, message, data)
    );
  }
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

