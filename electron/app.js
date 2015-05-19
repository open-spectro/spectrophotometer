'use strict';

var app = require('app');
var BrowserWindow = require('browser-window');

var mainWindow = null;

app.on('window-all-closed', function() {
    app.quit();
});

app.on('ready', function() {
    mainWindow = new BrowserWindow({width: 1920, height: 1080});

    mainWindow.loadUrl('file://' + __dirname + '/visualizer.html?' +
	    'config=' + encodeURIComponent('file://' + __dirname + '/config.json') +
        '&viewURL=' + encodeURIComponent('file://' + __dirname + '/view.json'));

    mainWindow.on('closed', function() {
        mainWindow = null;
    });
});
