import { App, LogLevel, BotMessageEvent } from '@slack/bolt';
import { TodoItemStatus, TodoServiceCreate } from './services/TodoService';
import { stringToEnum } from './utils/enum';

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  logLevel: LogLevel.DEBUG
});

app.message('hello', async ({ message, say }) => {
  // say() sends a message to the channel where the event was triggered
  let msg = message as BotMessageEvent;
  await say({
    blocks: [
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": `Hey there <@${msg.user}>!`
        },
        "accessory": {
          "type": "button",
          "text": {
            "type": "plain_text",
            "text": "Click Me"
          },
          "action_id": "button_click"
        }
      }
    ],
    text: `Hey there <@${msg.user}>!`
  });
});

app.action('button_click', async ({ body, ack, say }) => {
  // Acknowledge the action
  await ack();
  await say(`<@${body.user.id}> clicked the button`);
});

app.command('/todo-i', async ({ command, ack, body, logger, client }) => {
  await ack();

  const result = await client.views.open({
    trigger_id: body.trigger_id,
    view: {
      "type": "modal",
      "title": {
        "type": "plain_text",
        "text": "Add a new TODO",
        "emoji": true
      },
      "submit": {
        "type": "plain_text",
        "text": "Submit",
        "emoji": true
      },
      "close": {
        "type": "plain_text",
        "text": "Cancel",
        "emoji": true
      },
      "blocks": [
        {
          "type": "input",
          "element": {
            "type": "plain_text_input",
            "action_id": "plain_text_input-action"
          },
          "label": {
            "type": "plain_text",
            "text": "Content",
            "emoji": true
          }
        },
        {
          "type": "input",
          "element": {
            "type": "checkboxes",
            "options": [
              {
                "text": {
                  "type": "plain_text",
                  "text": "Mark as Done",
                  "emoji": true
                },
                "value": "value-0"
              }
            ],
            "action_id": "checkboxes-action"
          },
          "label": {
            "type": "plain_text",
            "text": "Status",
            "emoji": true
          }
        }
      ]
    }
  });

  logger.info(result);
});

app.command('/todo-add', async ({ command, ack, body, logger, client }) => {
  await ack();

  const todo = TodoServiceCreate(command.user_id, logger);
  const result = await todo.add(command.text);

  logger.debug(JSON.stringify(result));
});

app.command('/todo-list', async ({ command, ack, body, logger, client, say }) => {
  await ack();

  const todo = TodoServiceCreate(command.user_id, logger);
  // Convert the text into one of the TodoItemStatus enum, default to ALL if invalid
  const status: TodoItemStatus = stringToEnum<TodoItemStatus>(TodoItemStatus, command.text, TodoItemStatus.ALL);
  const result = await todo.list(status);

  await say(JSON.stringify(result));
  logger.debug(JSON.stringify(result));
});

app.command('/todo-delete', async ({ command, ack, body, logger, client, say }) => {
  await ack();

  const todo = TodoServiceCreate(command.user_id, logger);
  const result = await todo.delete(command.text);

  logger.debug(JSON.stringify(result));
});

app.command('/todo-done', async ({ command, ack, body, logger, client, say }) => {
  await ack();

  const todo = TodoServiceCreate(command.user_id, logger);
  const result = await todo.update(command.text, { status: TodoItemStatus.DONE });

  logger.debug(JSON.stringify(result));
});

(async () => {
  await app.start(Number(process.env.PORT) || 3000);

  console.log('⚡️ Bolt app is running!');
})();