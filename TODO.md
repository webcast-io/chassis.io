TODO
===

- When a socket closes from the client, remove the socket from all channels.
- When a socket closes from the server, attempt reconnection.
- When a socket successfully reconnects, make it subscribe to channels it was subscribed to before it cut out.
- Provide an easy way to bind to client-side pubsub events in an event-emitter style.
- Be able to configure between using Redis and Memory pubsub storage.
- Figure out a nice way to bundle engine.io and chassis client-side js libraries.