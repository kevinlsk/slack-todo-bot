import { HomeView, BlockAction, SlackAction, SlackEventMiddlewareArgs, SlackActionMiddlewareArgs, AllMiddlewareArgs, SlackViewAction, SlackViewMiddlewareArgs, CheckboxesAction } from '@slack/bolt';
import { TodoListBlock, TodoListBlockUpdateItems } from './TodoListBlock';
import { TodoItem, TodoItemStatus, TodoServiceCreate } from 'services/TodoService';
import { TodoSectionAddBlock } from './TodoSectionAddBlock';
import { TodoAddModalTextInputBlockID, TodoAddModalTextInputActionID, TodoAddModelSubmissionHelper, TodoAddModalShow } from './TodoAddModal';
import { WebClient } from '@slack/web-api';
import { Logger } from '@slack/bolt';

export const TodoHomeViewCheckboxActionID = "TodoHomeViewCheckboxActionID";
export const TodoHomeViewAddButtonActionID = "TodoHomeViewAddButtonActionID";
export const TodoHomeViewAddModalCallbackID = "TodoHomeViewAddModalCallbackID";

function TodoHomeView(todos: Array<TodoItem>): HomeView {
  const todoList = TodoListBlock(todos, TodoHomeViewCheckboxActionID);
  const sectionAdd = TodoSectionAddBlock(TodoHomeViewAddButtonActionID);

  return {
    type: 'home',
    blocks: [
      sectionAdd,
      todoList
    ]
  };
}

export async function TodoHomeViewAppHomeOpenedCallback(props: SlackEventMiddlewareArgs<"app_home_opened"> & AllMiddlewareArgs) {
  await TodoHomeViewRefresh(props.event.user, props.client, props.logger);
}

export async function TodoHomeViewCheckboxActionCallback(props: SlackActionMiddlewareArgs<SlackAction> & AllMiddlewareArgs) {
  await props.ack();
  props.logger.debug(`TodoHomeViewCheckboxActionCallback()`);

  let checkboxAction: CheckboxesAction = props.action as CheckboxesAction;
  await TodoListBlockUpdateItems(props.body.user.id, checkboxAction.selected_options, props.logger, {
    status: TodoItemStatus.DONE
  });

  await TodoHomeViewRefresh(props.body.user.id, props.client, props.logger);
}

export async function TodoHomeViewAddButtonActionCallback(props: SlackActionMiddlewareArgs<SlackAction> & AllMiddlewareArgs) {
  await props.ack();
  props.logger.debug(`TodoHomeViewAddButtonActionCallback() called`);
  
  const triggerID = (props.body as BlockAction).trigger_id;
  await TodoAddModalShow(triggerID, TodoHomeViewAddModalCallbackID, props.client);
}

export async function TodoHomeViewAddModelSubmissionCallback(props: SlackViewMiddlewareArgs<SlackViewAction> & AllMiddlewareArgs) {
  await props.ack();
  props.logger.debug(`TodoHomeViewAddModelSubmissionCallback() called`);

  const content = props.body.view.state.values[TodoAddModalTextInputBlockID][TodoAddModalTextInputActionID].value!;
  await TodoAddModelSubmissionHelper(props.body.user.id, content, props.logger);
  await TodoHomeViewRefresh(props.body.user.id, props.client, props.logger);
}

async function TodoHomeViewRefresh(userID: string, client: WebClient, logger: Logger) {
  const todoService = TodoServiceCreate(userID, logger);

  const listResult = await todoService.list(TodoItemStatus.ALL);
  await client.views.publish({
    user_id: userID,
    view: TodoHomeView(listResult.data ?? [])
  });
}