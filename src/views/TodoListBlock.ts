import { ActionsBlock, SectionBlock, Checkboxes, PlainTextOption, MrkdwnOption } from '@slack/bolt';
import { TodoItem, TodoItemStatus } from 'services/TodoService';

export function TodoListBlock(todos: Array<TodoItem>, actionID: string): ActionsBlock {
  let action: ActionsBlock = {
    type: 'actions',
    elements: [],
  };

  let checkboxes: Checkboxes = {
    type: 'checkboxes',
    options: [],
    action_id: `${actionID}-0`
  }

  for (let i = 0; i < todos.length; ++i) {
    const isDone = (todos[i].status && todos[i].status === TodoItemStatus.DONE);
    const content = todos[i].content ?? '';
    const text = isDone ? `~${content}~` : content;

    let option: MrkdwnOption = {
      text: {
        type: 'mrkdwn',
        text: text
      },
      value: todos[i].id
    };

    if (i % 10 === 0) {
      if (checkboxes.options.length > 0) {
        action.elements.push(checkboxes);
      }

      checkboxes = {
        type: 'checkboxes',
        options: [],
        action_id: `${actionID}-${i}`
      };
    }

    checkboxes.options.push(option);
    if (isDone) {
      if (!checkboxes.initial_options) {
        checkboxes.initial_options = [];
      }
      
      checkboxes.initial_options.push(option);
    }
  }

  if (checkboxes.options.length > 0) {
    action.elements.push(checkboxes);
  }

  return action;
}