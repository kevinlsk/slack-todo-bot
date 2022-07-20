import { App, LogLevel } from '@slack/bolt';
import { TodoHomeMiddleware } from 'middlewares/TodoHomeMiddleware';
import { TodoItemStatus, TodoServiceCreate } from 'services/TodoService';
import { TodoCommandMiddleware } from 'middlewares/TodoCommandMiddleware';

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  logLevel: LogLevel.DEBUG
});


/**********************************************
 * App Home routes
 **********************************************/
 const todoHomeMiddleware = new TodoHomeMiddleware();

app.event('app_home_opened', todoHomeMiddleware.appHomeOpenedCallback);
app.action(new RegExp(`^${TodoHomeMiddleware.CheckboxID}-.+$`), todoHomeMiddleware.checkboxActionCallback);
app.action(TodoHomeMiddleware.AddButtonID, todoHomeMiddleware.addButtonActionCallback);

// Instead of listening for 'view_submission', listen for 'callback_id' which is defined during modal creation
// https://github.com/slackapi/bolt-js/issues/551
app.view(TodoHomeMiddleware.ModalSubmissionID, todoHomeMiddleware.modelSubmissionCallback);


/***********************************************
 * Slack interative commands
 ***********************************************/
const commandMiddleware = new TodoCommandMiddleware();

// Add a new TODO in interactive mode
app.command('/todo-i', commandMiddleware.commandInteractiveAddCallback);

app.command('/todo-list', commandMiddleware.listCallback);
app.action(new RegExp(`^${TodoCommandMiddleware.ModalCheckboxID}-.+$`), commandMiddleware.checkboxActionCallback);
app.action(TodoCommandMiddleware.ModalAddButtonID, commandMiddleware.addButtonActionCallback);
app.view(TodoCommandMiddleware.ModalSubmissionID, commandMiddleware.modalSubmissionCallback);


/************************************************
 * Slack commands
 ************************************************/
app.command('/todo-add', commandMiddleware.commandAddCallback);
app.command('/todo-delete', commandMiddleware.commandDeleteCallback);
app.command('/todo-done', commandMiddleware.commandDoneCallback);


/*******************************************
 * Start event loop
 *******************************************/
(async () => {
  await app.start(Number(process.env.PORT) || 3000);

  console.log('⚡️ Bolt app is running!');
})();