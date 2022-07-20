# Setup dev environment
### Setup your local machine
1. Install dependencies
   ```
   yarn install
   ```
1. Create a folder to store secrets locally, also create the file to store environment variables
   ```
   mkdir secrets
   touch secrets/dev.env
   ```
1. Setup `ngrok`
   1. Sign up in `ngrok` website: https://ngrok.com
   1. Install `ngrok` binary on Mac
       ```
       brew install ngrok/ngrok/ngrok
       ```
   1. Run `ngrok` to point to your local Node.js port, it's usually port 3000
      ```
      ngrok http 3000
      ```

### Configure Slack
1. Head to https://api.slack.com/apps
1. Click "Create New App".
1. Go to "OAuth & Permissions", click "Add an OAuth Scope", select "chat:write" and click "Save".
1. Click "Create Bot Token".
1. Copy the "Bot User OAuth Token" value and paste it in local file named `secrets/dev.env`. Please the value in the file in this format without the '<>' characters.
   ```
   SLACK_BOT_TOKEN=<THE_TOKEN_VALUE>
   ```
1. Go to "Basic Information", copy the "Signing Secret" value. Paste it in the "secrets/dev.env" file without the '<>' characters.
   ```
   SLACK_SIGNING_SECRET=<THE_SIGNING_SECRET>
   ```
1. Go to "App Manifest", make sure to select the YAML section, paste the content of your local `slack-app-manifest.yml`.
 Replace `https://8113-5-254-162-15.eu.ngrok.io` with the your `ngrok` URL. Click "Save Changes".

### Configure Cloud Firestore
1. Sign up for Firebase
1. Create a new Firestore project
1. In the Firebase console, open **Project Settings > Service Accounts > Firebase Admin SDK.**
1. Click "Generate New Private Key", then confirm by clicking "Generate Key".
1. Save the key file into `secrets/` folder that you've created.
1. Add a new environment variable in `secrets/dev.env` to point to the key file. Note, the value must be in absolute path.
   ```
   GOOGLE_APPLICATION_CREDENTIALS=/Users/kevin/GitHub/slack-todo-bot/secrets/firebaseAccountKey.json
   ```

   Reference:
   - https://firebase.google.com/docs/firestore/quickstart
   - https://firebase.google.com/docs/admin/setup#initialize-sdk

### Finally
1. Run the bot
   ```
   yarn dev
   ```

# How to use?
You can use this slack bot with Slack commands in any channel or message. Supported Slack commands are:
- /todo-i
- /todo-add
- /todo-list <all | open | done>
- /todo-done TODO_ITEM_ID
- /todo-delete TODO_ITEM_ID

Alternatively, you can use it from "App Home". Just select "slack-todo-bot" in the sidebar.


# Known issues
- [ ] Cannot re-open a completed TODO item
- [ ] Cannot edit the content of TODO item
- [ ] Cannot delete the TODO item with UI, though you can delete with command /todo-delete
- [ ] /todo-list command displays checkboxes in the message. User can check off the TODO item, but it will not update the item with a strike line
- [x] UI / command callbacks are mis-placed in views module. They should be in separate "middleware" modules.
- [ ] Unit tests are missing
- [ ] Slack limits the number of checkboxes to 10 at a time, the workaround right now is to group 10 checkboxes as an element,
 but that causes an extra line spacing between the groups
