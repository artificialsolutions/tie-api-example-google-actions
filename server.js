/**
 * Copyright 2018 Artificial Solutions. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *    http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const dotenv = require('dotenv');
dotenv.config();

const { BasicCard, actionssdk } = require('actions-on-google');
const express = require('express');
const bodyParser = require('body-parser');
const TIE = require('@artificialsolutions/tie-api-client');

const teneoApi = TIE.init(process.env.TENEO_ENGINE_URL);

const assistant = actionssdk();

// initialise session handler, to store mapping between conversationId and engine session id
const sessionHandler = SessionHandler();

// Hande main intent
assistant.intent('actions.intent.MAIN', async conv => {

    // send message to teneo and return response
    await handleMessage(conv);

})

// handle text inputs
assistant.intent('actions.intent.TEXT', async conv => {

    // send message to teneo and return response
    await handleMessage(conv);

})

async function handleMessage(conv) {

    // get the id of the conversation so we can map it to an engine session
    var userToken = conv.id;

    // check if we have stored an engine sessionid for this user
    var teneoSessionId = "";
    if (sessionHandler.getSession(userToken)) {
        teneoSessionId = sessionHandler.getSession(userToken);
    }
    console.log("teneoSessionId: " + teneoSessionId);

    // message can be empty, mostly for main intent
    let message = "";
    if (conv.input.raw) {
        message = conv.input.raw;
    }
    console.log(`Got message '${message}' for session: '${teneoSessionId}'`);

    // get answer to message from teneo using sessionId stored in user storage
    const teneoResponse = await teneoApi.sendInput(teneoSessionId, {
        text: message,
        'channel': 'googleactions'
    });

    if (teneoResponse.status == 0) {
        console.log(`Got Teneo Engine response '${teneoResponse.output.text}' with session ${teneoResponse.sessionId}`);

        // your bot can use output parameters to populate rich responses
        // you would find those in teneoResponse.output.parameters

        // store engine session id session storage
        console.log("storing session [" + teneoResponse.sessionId + "] for token [" + userToken + "]")
        sessionHandler.setSession(userToken, teneoResponse.sessionId);

        // check if we need to close the conversation 
        const outputType = teneoResponse.output.parameters.gaOutputType;

        // send teneo answer to assistant
        if (outputType == 'close') {
            conv.close(teneoResponse.output.text);
        } else {
            conv.ask(teneoResponse.output.text);
        }

        // parse engine output parameter 'googleactions' with rich response data
        // but only if assistant device supports rich responses
        // https://developers.google.com/actions/assistant/responses#rich-responses
        if (teneoResponse.output.parameters.googleactions && conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT')) {
            try {
                // send rich response to assistant
                conv.ask(JSON.parse(teneoResponse.output.parameters.googleactions));
            } catch (error_attach) {
                console.error(`Failed when parsing attachment JSON`, error_attach);
            }
        }

    } else {
        // engine returned an error
        conv.close("I'm sorry, something went wrong.");
    }

}

/***
 * SESSION HANDLER
 ***/
function SessionHandler() {

    // Map the conversation id id to the teneo engine session id. 
    // This code keeps the map in memory, which is ok for testing purposes
    // For production usage it is advised to make use of more resilient storage mechanisms like redis
    const sessionMap = new Map();
  
    return {
      getSession: (userId) => {
        if (sessionMap.size > 0) {
          return sessionMap.get(userId);
        }
        else {
          return "";
        }
      },
      setSession: (userId, sessionId) => {
        sessionMap.set(userId, sessionId)
      }
    };
}


const expressApp = express().use(bodyParser.json());
expressApp.post('/', assistant);
expressApp.get('/', function (req, res) {
    res.send('Connector running');
});
expressApp.listen(process.env.PORT || 3769);
console.log("listening on port " + process.env.PORT);