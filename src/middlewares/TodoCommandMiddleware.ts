import { SlackCommandMiddlewareArgs, AllMiddlewareArgs, SlackViewMiddlewareArgs, SlackViewAction, RespondArguments, SlackActionMiddlewareArgs, SlackAction, CheckboxesAction, BlockAction } from '@slack/bolt';
import { TodoItemStatus, TodoServiceCreate } from 'services/TodoService';
import { stringToEnum } from 'utils/enum';
import { TodoAddModalShow, TodoAddModalTextInputActionID, TodoAddModalTextInputBlockID, TodoAddModelSubmissionHelper } from 'views/TodoAddModal';
import { TodoListBlock, TodoListBlockUpdateItems } from 'views/TodoListBlock';
import { TodoSectionAddBlock } from 'views/TodoSectionAddBlock';


export class TodoCommandMiddleware {
  static ModalSubmissionID = "TodoCommandMiddleware_ModalSubmissionID";
  static ModalAddButtonID = "TodoCommandMiddleware_ModalAddButtonID";
  static ModalCheckboxID = "TodoCommandMiddleware_ModalCheckboxID";

  async checkboxActionCallback(props: SlackActionMiddlewareArgs<SlackAction> & AllMiddlewareArgs) {
    await props.ack();
    props.logger.debug(`TodoCommandListCheckboxActionCallback()`);

    let checkboxAction: CheckboxesAction = props.action as CheckboxesAction;
    await TodoListBlockUpdateItems(props.body.user.id, checkboxAction.selected_options, props.logger, {
      status: TodoItemStatus.DONE
    });
  }

  async interactiveAddCallback(props: SlackCommandMiddlewareArgs & AllMiddlewareArgs) {
    props.ack();
    props.logger.debug(`TodoCommandInteractiveAddCallback()`);

    TodoAddModalShow(props.command.trigger_id, TodoCommandMiddleware.ModalSubmissionID, props.client);
  }

  async addButtonActionCallback(props: SlackActionMiddlewareArgs<SlackAction> & AllMiddlewareArgs) {
    await props.ack();
    props.logger.debug(`TodoCommandListAddButtonActionCallback()`);

    const triggerID = (props.body as BlockAction).trigger_id;
    await TodoAddModalShow(triggerID, TodoCommandMiddleware.ModalSubmissionID, props.client);
  }

  async modalSubmissionCallback(props: SlackViewMiddlewareArgs<SlackViewAction> & AllMiddlewareArgs) {
    await props.ack();

    props.logger.debug(`TodoCommandAddModalSubmissionCallback()`);
    const content = props.body.view.state.values[TodoAddModalTextInputBlockID][TodoAddModalTextInputActionID].value!;
    await TodoAddModelSubmissionHelper(props.body.user.id, content, props.logger);
  }

  async listCallback(props: SlackCommandMiddlewareArgs & AllMiddlewareArgs) {
    await props.ack();

    props.logger.debug(`TodoCommandListCallback()`);

    const todo = TodoServiceCreate(props.command.user_id, props.logger);

    // Convert the text into one of the TodoItemStatus enum, default to OPEN if invalid
    const status: TodoItemStatus = stringToEnum<TodoItemStatus>(TodoItemStatus, props.command.text, TodoItemStatus.ALL);
    const todos = (await todo.list(status)).data ?? []

    props.logger.debug(JSON.stringify(todos));

    let responseArgs: RespondArguments = {
      response_type: 'ephemeral',
      blocks: [
        TodoSectionAddBlock(TodoCommandMiddleware.ModalAddButtonID),
        TodoListBlock(todos, TodoCommandMiddleware.ModalCheckboxID)
      ]
    };

    await props.respond(responseArgs);
  }
}