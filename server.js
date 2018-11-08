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

const { BasicCard, actionssdk } = require('actions-on-google')
const express = require('express');
const bodyParser = require('body-parser');
const TIE = require('@artificialsolutions/tie-api-client');

const teneoApi = TIE.init(process.env.TENEO_ENGINE_URL); 

const assistant = actionssdk();

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

    // message can be empty, mostly for main intent
    let message = "";
    if(conv.input.raw) {
        message = conv.input.raw;
    }
    console.log(`Got message '${message}' for session: '${conv.user.storage.sessionId}'`);

    // get answer to message from teneo using sessionId stored in user storage
    const teneoResponse = await teneoApi.sendInput(conv.user.storage.sessionId, {
            text: message
    })
    
    if (teneoResponse.status == 0) {
        console.log(`Got Teneo Engine response '${teneoResponse.output.text}' with session ${teneoResponse.sessionId}`);

        // your bot can use output parameters to populate rich responses
        // you would find those in teneoResponse.output.parameters

        // store engine session id in user storage
        conv.user.storage.sessionId = teneoResponse.sessionId;

        // send teneo answer to assistant
        conv.ask(teneoResponse.output.text);
        
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

const expressApp = express().use(bodyParser.json());
expressApp.post('/', assistant)
expressApp.get('/', function(req, res){
    res.send('Connector running');
});
expressApp.listen(process.env.PORT || 3769)
