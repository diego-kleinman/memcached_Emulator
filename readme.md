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
* Message type (command or value)
* If message is value, ¿Is it the first line of value input?

According to this data, the server processes the request from the client.

## Improvements to do

### Purging process eficciency

The purging process could be more efficient. It goes through all the cache, and process every object.
But according to memcached protocol, if an object has exptime = 0, it doesn't expire.

The server could have an additional cache to store objects with exptime = 0, in that case the purging process wouldn't have to go through values that don't even have to be checked because they won't expire.

## Conclusion

It was an interesting challenge to do, I had to investigate a lot and implement (in my own way) a part of a real protocol that is used in a lot of systems worldwide.
It was challenging but really fun to do, and I think I learnt a lot of usefull things doing it.

