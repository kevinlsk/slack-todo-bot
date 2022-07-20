
import { BlockAction, SlackAction, SlackEventMiddlewareArgs, SlackActionMiddlewareArgs, AllMiddlewareArgs, SlackViewAction, SlackViewMiddlewareArgs, CheckboxesAction } from '@slack/bolt';
import { TodoListBlockUpdateItems } from 'views/TodoListBlock';
import { TodoItemStatus, TodoServiceCreate } from 'services/TodoService';
import { TodoAddModalViewTextInputBlockID, TodoAddModalViewTextInputActionID, TodoAddModelViewSubmissionHelper, TodoAddModalViewShow } from 'views/TodoAddModal';
import { WebClient } from '@slack/web-api';
import { Logger } from '@slack/bolt';
import { TodoHomeView } from 'views/TodoHomeView';


export class TodoHomeMiddleware {
  static AddButtonID = "TodoHomeMiddleware_AddButtonID";
  static CheckboxID = "TodoHomeMiddleware_CheckboxID";
  static ModalSubmissionID = "TodoHomeMiddleware_ModalSubmissionID";

  async appHomeOpenedCallback(props: SlackEventMiddlewareArgs<"app_home_opened"> & AllMiddlewareArgs) {
    await viewRefresh(props.event.user, props.client, props.logger);
  }

  async checkboxActionCallback(props: SlackActionMiddlewareArgs<SlackAction> & AllMiddlewareArgs) {
    await props.ack();
    props.logger.debug(`TodoHomeViewCheckboxActionCallback()`);

    let checkboxAction: CheckboxesAction = props.action as CheckboxesAction;
    await TodoListBlockUpdateItems(props.body.user.id, checkboxAction.selected_options, props.logger, {
      status: TodoItemStatus.DONE
    });

    await viewRefresh(props.body.user.id, props.client, props.logger);
  }

  async addButtonActionCallback(props: SlackActionMiddlewareArgs<SlackAction> & AllMiddlewareArgs) {
    await props.ack();
    props.logger.debug(`TodoHomeViewAddButtonActionCallback() called`);

    const triggerID = (props.body as BlockAction).trigger_id;
    await TodoAddModalViewShow(triggerID, TodoHomeMiddleware.ModalSubmissionID, props.client);
  }

  async modelSubmissionCallback(props: SlackViewMiddlewareArgs<SlackViewAction> & AllMiddlewareArgs) {
    await props.ack();
    props.logger.debug(`TodoHomeViewAddModelSubmissionCallback() called`);

    const content = props.body.view.state.values[TodoAddModalViewTextInputBlockID][TodoAddModalViewTextInputActionID].value!;
    await TodoAddModelViewSubmissionHelper(props.body.user.id, content, props.logger);
    await viewRefresh(props.body.user.id, props.client, props.logger);
  }
}

async function viewRefresh(userID: string, client: WebClient, logger: Logger) {
  const todoService = TodoServiceCreate(userID, logger);

  const listResult = await todoService.list(TodoItemStatus.ALL);
  await client.views.publish({
    user_id: userID,
    view: TodoHomeView(listResult.data ?? [], TodoHomeMiddleware.AddButtonID, TodoHomeMiddleware.CheckboxID)
  });
}