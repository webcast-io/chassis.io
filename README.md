Chassis.IO
==========

A lightweight wrapper around engine.io to let you add real-time features to your Express.js application.

[![Build Status](https://travis-ci.org/axisto-live/chassis.io.png?branch=master)](https://travis-ci.org/webcast.io/chassis.io)

Installation
---

    npm install chassis.io

Setting up Chassis.io in your app
---

```javascript

    var chassis = require('chassis.io'),
        server  = express.createServer();

    // Use the same interface that you would with
    // attaching engine.io to your Express server.
    var app = chassis.attach(server, options);
    app.listen(3000);

```

You'll also need to add the following client-side JS libraries to your web application:

- Engine.io-client
- Chassis.io-client

[TODO - put links to there libraries above]

In this order:

```html
    
    <script src="/js/engine.io.js"></script>
    <script src="/js/chassis.io.js"></script>

```

Usage
---

There are 5 actions that you can call from the chassis.io client:

- set

  Set a data object on the server-side socket object.

- subscribe

  Subscribe to a channel on the server

- publish

  Publish a message to a channel on the server. 

- unsubscribe

  Unsubscribe from a channel on the server. 

- rfc

  Call a function on the server, and get back a response

Handling the client-side API calls on the server
---

- set



Test
---

```javascript

    npm test

```

Background
---

Chassis.io was built as a replacement of the NowJS library in one of our applications. It's designed to mimic some of NowJS' functionality, but to also solve some of the challenges of running a websocket-based application across multiple Node.js processes.

Credits & License
---

&copy; 2013 Axisto Media Ltd. Chassis.io is licensed under the MIT License.
