'use strict';

const line = require('@line/bot-sdk');
const express = require('express');

// create LINE SDK config from env variables
const config = {
  channelAccessToken: "k5Q7QtQZFZ2v1LkfGcwEUU4V9LlPdrP34jOLzoFGYggIRtEuJWdv0VJsbletpWlz5T+ONX1bK6B8ZAbFlGggqHWwtgl2BtcG/N5z3o0QgehAiR0Z7NuUGsxguxO8SnWKigJRqnih3RiScLj1PbCzOAdB04t89/1O/w1cDnyilFU=",
  channelSecret: "56fe1efe851985cd2ab135863f1ed13a",
};
// create LINE SDK client
const client = new line.Client(config);

// create Express app
// about Express itself: https://expressjs.com/
const app = express();

// register a webhook handler with middleware
// about the middleware, please refer to doc
app.post('/callback', line.middleware(config), (req, res) => {
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

// event handler
function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    // ignore non-text-message event
    return Promise.resolve(null);
  } else if (event.message.type === "text" || event.message.text === "Hello") {
    const payload = {
      type: "text",
      text: "Hello from heroku server"
    };
    return client.pushMessage(event.pushMessage, payload);
  }

  

  // create a echoing text message
  const echo = { type: 'text', text: event.message.text };

  // use reply API
  return client.replyMessage(event.replyToken, echo);
}

// listen on port
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});
