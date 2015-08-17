# Learning spectrophotometry

## Introduction

You can find very expensive and powerful 
spectrophotometer on the market but for teaching they are most
of the time a black box that can not be open.

In order to be able to better teach the technique we would
like to create a simple, open source, spectrophotometer.

The idea is relatively simple. You have 4 leds (red, green,
blue, white) that can be turned on / off. The beam will
cross a cell, go through a slit and is diffracted using a
grating film.

A linear sensor allows to analyze the intensity of each
resulting wavelength.

There are 4 main parts in this project
* the electronic and microcontroller
* the microcontroller firmware
* the box
* the end-user graphical interface

Thanks to a google chrome "apps" it is possible directly from the web-browser to control the instrument. The application is available for [free on the store])https://chrome.google.com/webstore/detail/open-spectrophotometer/bmkhbnoonjkmdlkfncokjkanfgilppkn).

## Electronic and microcontroller

We played for a while with the Arduino platform and quickly
found out that you can relatively easily create your own
board that is compatible with the Arduino software.

This means that all the electronic can be designed to fit
exactly your needs but you will still be able to program
the device using the [Arduino](http://www.arduino.cc/).

The linear sensor is based on the linear sensor array 
[TSL1402R](http://ams.com/content/download/250165/975693/TSL1402R_Datasheet_EN_v1.pdf).

### Buttons

In order to prevent any problems with mechanical buttons and
buttons on the service, capasitive sensors are considered.

http://playground.arduino.cc/Main/CapacitiveSensor?from=Main.CapSense

## Firmware

The device emulates an Arduino Leonardo and can therefore be
programmed using the USB cable using the
[Arduino software](http://www.arduino.cc/en/Main/Software). We 
currently use version 1.0.6.

The first tie the bootloader has to be installed on the
microcontroller ATMega32U4.

## The box

To create the box we are using:
* [123D design](http://www.123dapp.com/design)
* [Robox 3D printer](http://www.cel-robox.com/)

## End-user graphical interface

The user interface is based on the 
[Visualizer](http://github.com/npellet/visualizer)

## Control from the terminal

From a terminal on the macintosh you could currently do something like

``` screen /dev/tty.usbmodemfd131 115200 ```

(you need to find the correct tty device using 

``` ls /dev/tty.usb* ```

To kill this session

``` CTRL + a and then k ```

You are then in the terminal menu and you can enter

```h + enter```

For the various options.

To take a spectrum:

```r + enter```

You will then have 10s (blue binling) to put the reference sample.
Once the green flash appears you have 10s to put the sample.

All the results may be pasted in a view:

http://www.cheminfo.org/Spectra/Spectrophotometer/Test.html




