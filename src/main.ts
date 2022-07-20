import { App, LogLevel } from '@slack/bolt';
import { TodoHomeViewAppHomeOpenedCallback, TodoHomeViewAddButtonActionID, TodoHomeViewCheckboxActionCallback, TodoHomeViewAddModelSubmissionCallback, TodoHomeViewAddButtonActionCallback, TodoHomeViewAddModalCallbackID } from 'views/TodoHomeView';
import { TodoItemStatus, TodoServiceCreate } from 'services/TodoService';
import { TodoCommandInteractiveAddModalCallbackID, TodoCommandAddModalSubmissionCallback, TodoCommandInteractiveAddCallback, TodoCommandListCallback, TodoCommandListCheckboxActionID, TodoCommandListCheckboxActionCallback, TodoCommandListAddButtonActionID, TodoCommandListAddButtonActionCallback, TodoCommandListAddModalCallbackID } from 'commands/TodoCommandCallbacks';

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  logLevel: LogLevel.DEBUG
});


/**********************************************
 * App Home routes
 **********************************************/
 app.event('app_home_opened', TodoHomeViewAppHomeOpenedCallback);
app.action(/^TodoHomeViewCheckboxActionID-.+$/, TodoHomeViewCheckboxActionCallback);
app.action(TodoHomeViewAddButtonActionID, TodoHomeViewAddButtonActionCallback);

// Instead of listening for 'view_submission', listen for 'callback_id' which is defined during modal creation
// https://github.com/slackapi/bolt-js/issues/551
app.view(TodoHomeViewAddModalCallbackID, TodoHomeViewAddModelSubmissionCallback);


/***********************************************
 * Slack interative commands
 ***********************************************/
// Add a new TODO in interactive mode
app.command('/todo-i', TodoCommandInteractiveAddCallback);
app.view(TodoCommandInteractiveAddModalCallbackID, TodoCommandAddModalSubmissionCallback);

app.command('/todo-list', TodoCommandListCallback);
app.action(/^TodoCommandListCheckboxActionID-.+$/, TodoCommandListCheckboxActionCallback);
app.action(TodoCommandListAddButtonActionID, TodoCommandListAddButtonActionCallback);
app.view(TodoCommandListAddModalCallbackID, TodoCommandAddModalSubmissionCallback);


/************************************************
 * Slack commands
 ************************************************/
app.command('/todo-add', async ({ command, ack, body, logger, client }) => {
  await ack();
  logger.debug(`/todo-add callback`);

  let content = command.text;
  if (content.length == 0) {
    logger.debug(`/todo-add callback, empty content, return`);
    return;
  }

  const todo = TodoServiceCreate(command.user_id, logger);
  const result = await todo.add(content);

  logger.debug(JSON.stringify(result));
});

app.command('/todo-delete', async ({ command, ack, logger }) => {
  await ack();
  logger.debug(`/todo-delete callback`);

  let itemID = command.text;
  if (itemID.length == 0) {
    logger.debug(`/todo-delete callback, empty item ID, return`);
    return;
  }

  const todo = TodoServiceCreate(command.user_id, logger);
  const result = await todo.delete(itemID);

  logger.debug(JSON.stringify(result));
});

app.command('/todo-done', async ({ command, ack, logger }) => {
  await ack();
  logger.debug(`/todo-done callback`);

  let itemID = command.text;
  if (itemID.length == 0) {
    logger.debug(`/todo-done callback, empty item ID, return`);
    return;
  }

  const todo = TodoServiceCreate(command.user_id, logger);
  const result = await todo.update(itemID, { status: TodoItemStatus.DONE });

  logger.debug(JSON.stringify(result));
});


/*******************************************
 * Start event loop
 *******************************************/
(async () => {
  await app.start(Number(process.env.PORT) || 3000);

  console.log('⚡️ Bolt app is running!');
})();