# Google Assistant Example Connector for Teneo
This node.js example connector uses the Google Actions SDK which allows you to make your Teneo bot available on Google Assistant and Google Home. The connector acts as middleware between the Google Assistant and Teneo. This guide will take you through the steps needed to make your bot available for testing on Google Assistant.

## Prerequisites
### Https
Google Assistant requires that the connector is available via https. On this page we will be using Heroku to host this connector, for which a (free) Heroku account is needed. You can however also manually install the connector on a location of your choice, see [Running the connector locally](#running-the-connector-locally).

### Teneo Engine
Your bot needs to be published and you need to know the engine url.

### Google Actions CLI
You will need to install the Google Actions Command Line Interface [gaction CLI](https://developers.google.com/actions/tools/gactions-cli)

## Setup instructions
### Deploy the bot connector
1. Click the button below to deploy the connector to Heroku:

    [![Deploy](https://www.herokucdn.com/deploy/button.svg?classes=heroku)](https://heroku.com/deploy?template=https://github.com/artificialsolutions/tie-api-example-google-actions)

2. In the 'Config Vars' section, add the following:
	* **TENEO_ENGINE_URL:** The engine url.
3. Click 'View app' and copy the url of your Heroku app and store it somewhere, you will need it later. It will be referred to as your 'connector url'.

If you prefer to run your bot locally, see [Running the connector locally](#running-the-connector-locally).

### Create a Google Assistant Project

1. Go to the [Actions on Google Developer Console](http://console.actions.google.com/).
2. Click on Add Project, enter name for the project, specify language and country and click Create Project.
3. On the page that appears, scroll down, select 'Custom', and click 'Next'.
4. Select 'Conversation Component', click 'Start Building', and wait a few moments for the Action Console's dashboard to appear.
6. On the screen that appears, under 'Quick Setup', click 'Decide how your Action is invoked' 
5. In 'Display Name', choose the invocation name you want to use to start a conversation with your bot.
Note: Some words are not allowed in the display name, for example: 'bot', 'assistant, and 'Google'.
6. Select a Google Assistant Voice, and click 'Save'.


### Create an Action package
In order to connect your bot to Google Assistant, you first need to create your own 'action package' locally as a JSON file. You will 'push' this action package to Google Assistant later.

1. Create a text file with the following content:
    ```
    {
        "actions": [
            {
                "description": "Default Welcome Intent",
                "name": "MAIN",
                "intent": {
                    "name": "actions.intent.MAIN"
                },
                "fulfillment": {
                    "conversationName": "teneo"
                }
            },
            {
                "description": "Conversational inputs",
                "name": "TEXT",
                "intent": {
                    "name": "actions.intent.TEXT"
                },
                "fulfillment": {
                    "conversationName": "teneo"
                }
            }
        ],
        "conversations": {
            "teneo": {
                "name": "teneo",
                "url": "YOUR_CONNECTOR_URL"
            }
        },
        "locale": "en"
	}
    ```
3. Replace <mark>YOUR_CONNECTOR_URL</mark> with the URL of your deployed bot connector.
4. Save the file and call it `action.json`.

Alternatively you can use the Google Actions Command Line Interface to generate an <mark>action.json</mark> file by running the command `gactions init`

### Push your action package to the Assistant Platform
1. Download the [gactions CLI](https://developers.google.com/actions/tools/gactions-cli) and follow the installation instructions.
2. Take note of PROJECT_ID, which is found in the URL of your Google Assistant Project. 
    In the next example URL, the part in bold is the PROJECT_ID: ht<span>tp://</span>console.actions.google.com/u/0/project/**myproject**/overview
3. Run the following command to push your action package to the Assistant Platform. Replace PROJECT_ID with the id of your Google Assistant project obtained in the previous step:
    ```
    $ gactions update --action_package action.json --project PROJECT_ID
    ```
    (alternatively you can modify the 'Update action command' you copied earlier and replace 'PACKAGE_NAME' with 'action.json')
    
4. Follow the instructions in the terminal to authenticate.

## Test your bot
You should now be able to test your bot:
1. Open your project on the [Actions on Google Developer Console](http://console.actions.google.com/).
2. Click on the 'Test' tab. Then, if this is the first time you open 'Test', a 'Start Testing' button may be shown. Click it and select 'Version-Draft' as the default action.
4. To activate your bot, ask Google Assistant 'Talk to [your bot invocation name]'. After that, your inputs will be sent to your bot.

## Engine input parameters
The connector will send the following input parameter along with the user input to the Teneo engine:

### channel
The input parameter `channel` with value `googleactions` is included in each request. This allows you to add channel specfic optimisations to your bot.

## Engine output parameters
The connector will check for the following output parameters in an output:

### gaOutputType
By default the connector will open the microphone after each answer that was received from Teneo. If the output parameter `gaOutputType` with the value `close` exists, the conversation will be ended.

### googleactions - Sending rich responses
To send [rich responses](https://developers.google.com/actions/assistant/responses#rich-responses), this connector looks for an [output parameter](/api#output-object) <mark>googleactions</mark> in the engine response. The value of that parameter is assumed to contain the rich response JSON as defined by Google.

If we look at Google's specification of a [basic card](https://developers.google.com/actions/assistant/responses#basic_card), the value of the <mark>googleactions</mark> output parameter to attach an image would look like this: 
```
{
    "basicCard": {
        "image": {
            "url": "https://url.to/an/image.png",
            "accessibilityText": "Alternate text"
        },
        "imageDisplayOptions": "CROPPED"
    }
}
```

For more details on how to populate output parameters in Teneo, please see: [How to populate output parameters](https://developers.artificial-solutions.com/studio/scripting/how-to/populate-output-parameters) in the [Build your bot](https://developers.artificial-solutions.com/studio/) section.

## Running the connector locally
If you prefer to manually install this connector or run it locally so you can extend it, proceed as follows:
1. Download or clone the connector source code from [Github](https://github.com/artificialsolutions/tie-api-example-google-actions).
2. Install dependencies by running `npm install` in the folder where you stored the source.
3. Make sure your connector is available via https. When running locally you can for example use ngrok for this: [ngrok.com](https://ngrok.com). The connector runs on port 3769 by default.
4. Create a `.env` file in the folder where you stored the source and add the URL of your engine. Optionally you can also specify the port number:
    ```
    TENEO_ENGINE_URL=<your_engine_url>
    PORT=3769
    ```
5. Start the connector with the following command:
    ```
    node server.js
    ```
