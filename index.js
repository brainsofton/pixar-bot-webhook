  
'use strict';

const line = require('@line/bot-sdk');
const express = require('express');
const hdTxt = require('./HandleText/HandleText')

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
  if (event.replyToken && event.replyToken.match(/^(.)\1*$/)) {
    return console.log("Test hook recieved: " + JSON.stringify(event.message));
  }

  switch (event.type) {
    case 'message':
      const message = event.message;
      switch (message.type) {
        case 'text':
          return hdTxt.handleText(message, event.replyToken, event.source);
        // case 'image':
        //   return handleImage(message, event.replyToken);
        // case 'video':
        //   return handleVideo(message, event.replyToken);
        // case 'audio':
        //   return handleAudio(message, event.replyToken);
        // case 'location':
        //   return handleLocation(message, event.replyToken);
        // case 'sticker':
        //   return handleSticker(message, event.replyToken);
        default:
          throw new Error(`Unknown message: ${JSON.stringify(message)}`);
      }

    case 'follow':
      return replyText(event.replyToken, 'Got followed event');

    case 'unfollow':
      return console.log(`Unfollowed this bot: ${JSON.stringify(event)}`);

    case 'join':
      return replyText(event.replyToken, `Joined ${event.source.type}`);

    case 'leave':
      return console.log(`Left: ${JSON.stringify(event)}`);

    case 'postback':
      let data = event.postback.data;
      if (data === 'DATE' || data === 'TIME' || data === 'DATETIME') {
        data += `(${JSON.stringify(event.postback.params)})`;
      }
      return replyText(event.replyToken, `Got postback: ${data}`);

    case 'beacon':
      return replyText(event.replyToken, `Got beacon: ${event.beacon.hwid}`);

    default:
      throw new Error(`Unknown event: ${JSON.stringify(event)}`);
  }
}

// listen on port
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});
