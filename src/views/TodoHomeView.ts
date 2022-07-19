import { HomeView, BlockAction, SlackAction, SlackEventMiddlewareArgs, SlackActionMiddlewareArgs, AllMiddlewareArgs, SlackViewAction, SlackViewMiddlewareArgs } from '@slack/bolt';
import { TodoListBlock } from './TodoListBlock';
import { TodoItem, TodoItemStatus, TodoServiceCreate } from 'services/TodoService';
import { TodoSectionAddBlock } from './TodoSectionAddBlock';
import { TodoAddModal, TodoAddModalTextInputBlockID, TodoAddModalTextInputActionID } from './TodoAddModal';
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
  await refreshTodoHomeView(props.event.user, props.client, props.logger);
}

export async function TodoHomeViewCheckboxActionCallback(props: SlackActionMiddlewareArgs<SlackAction> & AllMiddlewareArgs) {
  await props.ack();
  
  props.logger.debug(`TodoHomeViewCheckboxActionCallback() called`);
}

export async function TodoHomeViewAddButtonActionCallback(props: SlackActionMiddlewareArgs<SlackAction> & AllMiddlewareArgs) {
  await props.ack();

  props.logger.debug(`TodoHomeViewAddButtonActionCallback() called`);
  props.client.views.open({
    trigger_id: (props.body as BlockAction).trigger_id,
    view: TodoAddModal(TodoHomeViewAddModalCallbackID)
  });
}

export async function TodoHomeViewAddModelSubmissionCallback(props: SlackViewMiddlewareArgs<SlackViewAction> & AllMiddlewareArgs) {
  await props.ack();

  props.logger.debug(`TodoHomeViewAddModelSubmissionCallback() called`);

  const todoService = TodoServiceCreate(props.body.user.id, props.logger);
  const content = props.body.view.state.values[TodoAddModalTextInputBlockID][TodoAddModalTextInputActionID].value;

  if (!content) {
    props.logger.error(`TodoHomeViewAddModelSubmissionCallback(): empty input text`);
    return;
  }

  const result = await todoService.add(content);
  props.logger.debug(JSON.stringify(result));

  await refreshTodoHomeView(props.body.user.id, props.client, props.logger);
}

async function refreshTodoHomeView(userID: string, client: WebClient, logger: Logger): Promise<void> {
  const todoService = TodoServiceCreate(userID, logger);

  const listResult = await todoService.list(TodoItemStatus.ALL);
  await client.views.publish({
    user_id: userID,
    view: TodoHomeView(listResult.data ?? [])
  });
}