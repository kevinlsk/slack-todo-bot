import { App, LogLevel, BotMessageEvent } from '@slack/bolt';
import { TodoHomeViewAppHomeOpenedCallback, TodoHomeViewAddButtonActionCallback, TodoHomeViewAddButtonActionID, TodoHomeViewCheckboxActionCallback, TodoHomeViewAddModalCallbackID, TodoHomeViewAddModelSubmissionCallback } from 'views/TodoHomeView';
import { TodoItemStatus, TodoServiceCreate } from 'services/TodoService';
import { stringToEnum } from 'utils/enum';

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  logLevel: LogLevel.DEBUG
});

/**********************************************
 * App Home routes
 **********************************************/
app.action(/^TodoHomeViewCheckboxActionID-.+$/, TodoHomeViewCheckboxActionCallback);
app.action(TodoHomeViewAddButtonActionID, TodoHomeViewAddButtonActionCallback);
app.event('app_home_opened', TodoHomeViewAppHomeOpenedCallback);

// Instead of listening for 'view_submission', listen for 'callback_id' which is defined during modal creation
// https://github.com/slackapi/bolt-js/issues/551
app.view(TodoHomeViewAddModalCallbackID, TodoHomeViewAddModelSubmissionCallback);

/***********************************************
 * Slack commands
 ***********************************************/
app.command('/todo-i', async ({ command, ack, body, logger, client }) => {
  await ack();
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
  // Convert the text into one of the TodoItemStatus enum, default to OPEN if invalid
  const status: TodoItemStatus = stringToEnum<TodoItemStatus>(TodoItemStatus, command.text, TodoItemStatus.OPEN);
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


/*******************************************
 * Start event loop
 *******************************************/
(async () => {
  await app.start(Number(process.env.PORT) || 3000);

  console.log('⚡️ Bolt app is running!');
})();