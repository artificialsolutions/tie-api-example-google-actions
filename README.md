# tie-api-example-google-actions

This node.js example connector uses the Google Actions SDK which allows you to make your Teneo bot available on Google Assistant and Google Home. The connector acts as middleware between the Google Assistant and Teneo. This guide will take you through the steps needed to make your bot available for testing on Google Assistant.

You can find the source code of this connector on [Github](https://github.com/artificialsolutions/tie-api-example-google-actions).

## Prerequisites
### Https
Google Assistant requires that the connector is available via https. On this page we will be using Heroku to host this connector, for which a (free) Heroku account is needed. You can however also manually install the connector on a location of your choice, see [Running the connector locally](#running-the-connector-locally).

### Teneo Engine
Your bot needs to be published and you need to know the engine url.

### Google Actions CLI
You will need to install the Google Actions Command Line Interface [gaction CLI](https://developers.google.com/actions/tools/gactions-cli)

## Setup instructions
### Deploy the bot connector
Click the button below to deploy the connector to Heroku:

[![Deploy](https://www.herokucdn.com/deploy/button.svg?classes=noborder)](https://heroku.com/deploy?template=https://github.com/artificialsolutions/tie-api-example-google-actions)

In the 'Config Vars' section, add the following:
* **TENEO_ENGINE_URL:** The engine url.

Click 'View app' and copy the url of your Heroku app, you will need it in the next step.

!!! If you prefer to run your bot locally, see [Running the connector locally](#running-the-connector-locally).

### Create a Google Assistant Project

1. Go to the [Actions on Google Developer Console](http://console.actions.google.com/).
2. Click on Add Project, enter name for the project, and click Create Project.
3. On the page that appeard, choose 'Skip' in the top right corner.

### Create an Action package
In order to connect your bot to Google Assistant, you first need to create your own 'action package' locally as a JSON file. You will 'push' this action package to Google Assistant later.

1. Create a text file with the following content:
    ```
    {
      "actions": [
        {
          "name": "MAIN",
          "intent": {
            "name": "actions.intent.MAIN"
          },
          "fulfillment": {
            "conversationName": "teneo"
          }
        },
        {
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
          "url": "YOUR_CONNECTOR_URL",
          "fulfillmentApiVersion": 2
        }
      }
    }
    ```
3. Replace <mark>YOUR_CONNECTOR_URL</mark> in line 25 with the URL of your deployed bot connector.
4. Save the file and call it `action.json`.

### Push your action package to the Assistant Platform
1. Download the [gactions CLI](https://developers.google.com/actions/tools/gactions-cli) and follow the installation instructions.
2. Run the following command to push your action package to the Assistant Platform (replace PROJECT_ID with the id of your Google Assistant project):
    ```
    $ gactions test --action_package action.json --project PROJECT_ID
    ```
    Follow the instructions in the terminal to authenticate.

### Test your bot
You should now be able to test your bot:
1. Open your project on the [Actions on Google Developer Console](http://console.actions.google.com/).
2. On the left, under 'TEST' choose 'Simulator'.
3. To activate your bot, ask Google Assistant 'Talk to [your bot]'. After that, your inputs will be sent to your bot.

## Sending rich responses
To send [rich responses](https://developers.google.com/actions/assistant/responses#rich-responses), this connector looks for an output parameter `googleactions` in the engine response. The value of that parameter is assumed to contain the rich response JSON as defined by Google.

If we look at Google's specification of a [basic card](https://developers.google.com/actions/assistant/responses#basic_card), the value of the `googleactions` output parameter to attach an image would look like this: 
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

## Running the connector locally
If you prefer to manually install this connector or run it locally, proceed as follows:
1. Download or clone the connector source code from [Github](https://github.com/artificialsolutions/tie-api-example-google-actions).
2. Install dependencies by running `npm install` in the folder where you stored the source.
3. Make sure your connecter is available via https. When running locally you can for example use ngrok for this: [ngork.com](https://ngrok.com). The connector runs on port 3769 by default.
4. Start the connector with the following command (replacing the environment variables with the appropriate values):
    ```
    TENEO_ENGINE_URL=<your_engine_url> node server.js
    ```
