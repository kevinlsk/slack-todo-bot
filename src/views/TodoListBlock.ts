import { ActionsBlock, Checkboxes, Logger, MrkdwnOption, Option, SectionBlock } from '@slack/bolt';
import { TodoItem, TodoItemFragment, TodoItemStatus, TodoServiceCreate } from 'services/TodoService';

export function TodoListBlock(todos: Array<TodoItem>, actionID: string): ActionsBlock | SectionBlock {
  const placeholder: SectionBlock = {
    type: 'section',
    text: {
      type: 'plain_text',
      text: ' '
    },
  };

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

  // If there is no existing TODO items, return a placeholder to Slack to avoid exception.
  return action.elements.length > 0 ? action : placeholder;
}

export async function TodoListBlockUpdateItems(userID: string, selectedOptions: Option[], logger: Logger, fragment: TodoItemFragment) {
  const todoService = TodoServiceCreate(userID, logger);
  const nonCompleteItems = selectedOptions.filter(v => !v.text.text.match(/^~/));
  nonCompleteItems.forEach(async v => {
    await todoService.update(v.value!, fragment);
  });
}