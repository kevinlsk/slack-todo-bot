import { HomeView } from '@slack/bolt';
import { TodoListBlock } from './TodoListBlock';
import { TodoItem } from 'services/TodoService';
import { TodoSectionAddBlock } from './TodoSectionAddBlock';


export function TodoHomeView(todos: Array<TodoItem>, addButtonID: string, checkboxID: string): HomeView {
  const todoList = TodoListBlock(todos, checkboxID);
  const sectionAdd = TodoSectionAddBlock(addButtonID);

  return {
    type: 'home',
    blocks: [
      sectionAdd,
      todoList
    ]
  };
}
