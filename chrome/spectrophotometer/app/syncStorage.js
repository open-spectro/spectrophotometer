var SyncStorage = function() {

}

SyncStorage.prototype.get = function(key) {
  return new Promise(function(resolve, reject) {
    chrome.storage.sync.get(key, function(items) {
      if (chrome.runtime.lastError) {
        reject("Error: "+chrome.runtime.lastError.message);
      }
      resolve(items);
    });
  })
}

SyncStorage.prototype.set = function(key, value) {
  return new Promise(function(resolve, reject) {
    var toStore={};
    toStore[key]=value;
    chrome.storage.sync.set(toStore, function() {
      if (chrome.runtime.lastError) {
        reject("Error: "+chrome.runtime.lastError.message);
      }
      resolve(toStore);
    });
  })
}
