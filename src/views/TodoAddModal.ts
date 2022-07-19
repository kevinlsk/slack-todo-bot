import { ModalView } from '@slack/bolt';

export const TodoAddModalTextInputBlockID = "TodoAddModalTextInputBlockID";
export const TodoAddModalTextInputActionID = "TodoAddModalTextInputActionID";

export function TodoAddModal(callbackID: string): ModalView {
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
        block_id: TodoAddModalTextInputBlockID,
        element: {
          type: "plain_text_input",
          action_id: TodoAddModalTextInputActionID
        },
        label: {
          type: "plain_text",
          text: "Content",
        }
      }
    ]
  };
}