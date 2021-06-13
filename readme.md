# Memcached emulator

This proyect intends to emulate memcached, using a personal implementation following the memcached protocol

## Necessary resources

In order to run this project you must have [NodeJs](https://nodejs.org/es/download/) installed.

## Commands suported

Retrieval commands:
* get
* gets

Storage commands:
* set
* add
* replace
* append
* prepend
* cas

Extra:

* flush_all

## How to run

## Example of usage

EXAMPLES WITH PHOTOS AND DESCRPTIONS

## Running test cases

## Extras

### Architectural design

INSERT PHOTO

### Purging of expired keys

The server has a background process (running every second) in charge of "purging" expired keys. 
It checks every object stored in cache and modifies/deletes the object depending on the property "exptime".

### Management of multiple clients

The management of multiple clients is done with the help of socketio library.
Socketio enables realtime, bi-directional communication between clients and server; and like Node.js, it is event-driven.
When a client wants to connect to the server, socketio provides a socket for bi-directional communication between client-server. 

The client connects to the server and the server stores the socketId of the client (as a key) in an object called "currentClientsInputs", this object is the "controller" for multiple inputs of multiple clients.

The server has to know depending on which client is sending a message --> 

* Who sent it
* ¿Message sent is command or value?
* If message is value, ¿Is it the first line of value input?

According to this data, the server processes the request from the client.

## Improvements to do

## Conclusion



