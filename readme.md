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

* flush_all (Not 100% according to memcached protocol), doesn't allow exptime. Flushes when command is issued.

## How to run

In order to run this project you must have at least 2 console instances positioned in the root folder (1 for server instance, 1 or more for clients)

Steps to run:

* Install dependencies --> Execute `npm install` (only in one of the consoles, doesn't matter which one)
* Execute `node serverSide.js` in the console you want to set as server.
* Execute `node clientSide.js` in the console you want to set as client.
* You may want to set more clients, in that case you must open more console instances and execute `node clientSide.js` in all of them.

When you execute the serverSide.js, server will start listening for client connections and clients inputs. You don't have to do nothing else in the console instance running the server.

When you execute clientSide.js, client will connect to the server and display "connected" on the console instance. From there you can issue commands to the server.

In order to stop a client execution you must press "CTRL + C" twice in the console instance running the client, or close the console itself.
In order to stop the server execution you must do the same.

There can't be more than one server executing at the same moment.
(Server will execute in `localhost 3000`)

## Example of usage

EXAMPLES WITH PHOTOS AND DESCRPTIONS

## Running test cases

In order to run the test cases you must have a console instance running the serverSide and another console instance to execute the test cases.

Steps to run:

* **Recommended** (If you previously used the server and didn't close it till now) --> From the console not running the server you should execute `node clientSide.js` and from that client issue "flush_all", this will clear the current data from server. Then stop the client.
* From the console not running the server execute `npm test` and wait till finished.
* After running the test cases server should be flushed with step 1, otherwise if you execute the test cases again, they will fail, because the server now has data (the data input from previous testing). You could also restart the server and data will be cleared.

## Extras

### Architectural design

![This is a alt text.](/Diagram.png "This is a diagram image.")

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

