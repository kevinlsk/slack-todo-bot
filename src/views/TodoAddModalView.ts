import { ModalView, Logger } from '@slack/bolt';
import { WebClient } from '@slack/web-api';
import { TodoServiceCreate } from 'services/TodoService';

export const TodoAddModalViewTextInputBlockID = "TodoAddModalViewTextInputBlockID";
export const TodoAddModalViewTextInputActionID = "TodoAddModalViewTextInputActionID";

function TodoAddModalView(callbackID: string): ModalView {
  return {
    type: 'modal',
    title: {
      type: 'plain_text',
      text: 'Add a new TODO'
    },
    submit: {
      type: "plain_text",
      text: "Add"
    },
    close: {
      type: "plain_text",
      text: "Cancel"
    },
    callback_id: callbackID,
    blocks: [
      {
        type: "input",
        block_id: TodoAddModalViewTextInputBlockID,
        element: {
          type: "plain_text_input",
          action_id: TodoAddModalViewTextInputActionID
        },
        label: {
          type: "plain_text",
          text: "Content",
        }
      }
    ]
  };
}

export async function TodoAddModalViewShow(triggerID: string, callbackID: string, client: WebClient) {
  await client.views.open({
    trigger_id: triggerID,
    view: TodoAddModalView(callbackID)
  });
}

export async function TodoAddModelViewSubmissionHelper(userID: string, content: string, logger: Logger) {
  logger.debug(`TodoAddModelSubmissionCallback()`);

  if (!content) {
    logger.error(`TodoAddModelSubmissionCallback(): empty content: ${userID}`);
    return;
  }

  const todoService = TodoServiceCreate(userID, logger);
  const result = await todoService.add(content);
  logger.debug(JSON.stringify(result));
}