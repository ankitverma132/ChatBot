//Our node.js server which will communicate to dialogflow
const dialogflow = require('dialogflow');
const uuid = require('uuid');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 5000;
 // A unique identifier for the given session
 //We dont want to create session again and again
 //If we put it inside runSample method, everytime
 //a new session will create and follow up intent will not work
 const sessionId = uuid.v4();

//Using body-parser as middleware
//as we will get post request
app.use(bodyParser.urlencoded({
      extended : false
}))

//Using an middleware to make sure that server allows
//request from any domain i.e. it solves cross domain
//error with node.js server
app.use(function (req, res, next) {

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);

  // Pass to next layer of middleware
  next();
});

//Creating route
app.post('/send-msg', (req,res) => {
  //Req will goto dialogflow via runSample() method
  //and response data will be sent to UI in Reply
      runSample(req.body.MSG).then(data=>{
        res.send({Reply : data})
      })
})

/**
 * Send a query to the dialogflow agent, and return the query result.
 * @param {string} projectId The project to be used
 */
async function runSample(msg, projectId = 'rn-bot-9fit') {

  // Create a new session
  const sessionClient = new dialogflow.SessionsClient({
    keyFilename : "C:/Users/Ankit/Desktop/chat-bot/rn-bot-9fit-b4d970b3dba3.json"
  });
  const sessionPath = sessionClient.sessionPath(projectId, sessionId);

  // The text query request.
  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        // The query to send to the dialogflow agent
        //We will make it dynamic
        text: msg,
        // The language used by the client (en-US)
        languageCode: 'en-US',
      },
    },
  };

  // Send request and log result
  const responses = await sessionClient.detectIntent(request);
  console.log('Detected intent');
  const result = responses[0].queryResult;
  console.log(`  Query: ${result.queryText}`);
  console.log(`  Response: ${result.fulfillmentText}`);
  if (result.intent) {
    console.log(`  Intent: ${result.intent.displayName}`);
  } else {
    console.log(`  No intent matched.`);
  }
  return result.fulfillmentText; 
}

app.listen(port, ()=>{
  console.log("Server is up and running on Port", port); 
})