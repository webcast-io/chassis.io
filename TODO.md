TODO
===

- When a socket successfully reconnects, make it subscribe to channels it was subscribed to before it cut out.
- When a socket closes from the client, remove the socket from all channels.

- Provide an easy way to bind to client-side pubsub events in an event-emitter style.
- Figure out a nice way to bundle engine.io and chassis client-side js libraries.
- Be able to configure between using Redis and Memory pubsub storage.