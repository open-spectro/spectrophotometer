# Learning spectrophotometry

## Introduction

You can find very expensive and performant 
spectrophotometer on the market but for teaching they are most
of the time a black box that can not be open.

In order to be able to better teach the technique we would
like to create a simple, open source, spectrophotometer.

The idea is relatively simple. You have 4 leds (red, green,
blue, white) that can be turned on / off. The beam will
cross a cell, go through a slit and is diffracted using a
grating film.

A linear sensor allows to analyse the intensity of each
resulting wavelength.

There are 4 main parts in this project
* the electronic and microcontroller
* the microcontroller firmware
* the box
* the end-user graphical interface

We hope that we could transfer the data by emulating a keyboard
and send the result directly in a web page where it could be
processed.

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




