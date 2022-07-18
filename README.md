## Setup dev environment
1. Install dependencies
`yarn install`

1. Setup `ngrok`
  1. Sign up in `ngrok` website: https://ngrok.com
  1. Install `ngrok` binary on Mac
    `brew install ngrok/ngrok/ngrok`
  1. Run `ngrok`
    `ngrok http 3000`

1. Head to https://api.slack.com/apps
  1. Click "Create New App".
  1. Go to "OAuth & Permissions", click "Add an OAuth Scope", select "chat:write" and click "Save".
  1. Click "Create Bot Token".
  1. Copy the "Bot User OAuth Token" value and create a new local file named ".env". Please the value in the file in this format without the '<>' characters.
    `SLACK_BOT_TOKEN=<THE_TOKEN_VALUE>`
  1. Go to "Basic Information", copy the "Signing Secret" value. Paste it in the ".env" file without the '<>' characters.
    `SLACK_SIGNING_SECRET=<THE_SIGNING_SECRET>`
  1. Click "Event Subscriptions", toggle the switch to "Enable Events". Put in the URL generated from `ngrok` and suffix it with `/slack/event`. The verification of this URL will fail but that's fine. Come back and retry after the last step.
    `https://<your-domain>/slack/events`

1. Run the bot
  `yarn dev`