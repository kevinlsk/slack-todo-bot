import { Logger } from "@slack/bolt";
import { DBServiceCreate, DBService } from "./DBService";
import shortUUID from "short-uuid";
import { database } from "firebase-admin";

export interface TodoService {
  add(content: string): Promise<TodoResult>;
  update(id: string, content: string): Promise<TodoResult>;
  list(status: TodoItemStatus): Promise<TodoResult>;
  delete(id: string): Promise<TodoResult>;
}

export function TodoServiceCreate(user: string, logger: Logger) {
  return new PersistentTodoService(user, logger);
}

export interface TodoItem {
  id: string,
  content?: string,
  status?: TodoItemStatus,
}

export type TodoItemFragment = Omit<TodoItem, 'id'>;

export enum TodoItemStatus {
  DONE = "done",
  OPEN = "open",
  ALL = "all",
}

export enum TodoResultStatus {
  OK,
  FAILED
}

export interface TodoResult {
  status: TodoResultStatus,
  data?: Array<TodoItem>,
  error?: string
}

class PersistentTodoService {
  private user: string;
  private logger: Logger;
  private dbService: DBService;

  constructor(user: string, logger: Logger) {
    this.user = user;
    this.logger = logger;
    this.dbService = DBServiceCreate(user, logger);
  }

  async add(content: string): Promise<TodoResult> {
    this.logger.debug(`TodoService.add(): content=${content}`);
    const todoItem: TodoItemFragment = {
      content: content,
      status: TodoItemStatus.OPEN
    };

    await this.dbService.upsert(todoItem);

    return {
      status: TodoResultStatus.OK
    };
  }

  async update(id: string, fragment: TodoItemFragment): Promise<TodoResult> {
    const todoItem: TodoItem = {
      id: id,
      ...fragment
    };

    this.logger.debug(`TodoService.update(): todoItem=${todoItem}`);

    await this.dbService.upsert(todoItem);

    return {
      status: TodoResultStatus.OK
    };
  }

  async list(status: TodoItemStatus): Promise<TodoResult> {
    this.logger.debug(`TodoService.list(): status=${status}`);

    let data;
    if (status === TodoItemStatus.ALL) {
      data = await this.dbService.list();
    } else {
      data = await this.dbService.listByStatus(status);
    }

    const todos = data.map(v => {
      return {
        id: v.id,
        ...v.data()
      }
    });

    return {
      status: TodoResultStatus.OK,
      data: todos
    };
  }

  async delete(id: string): Promise<TodoResult> {
    this.logger.debug(`TodoService.delete(): id=${id}`);
  
    await this.dbService.deleteById(id);

    return {
      status: TodoResultStatus.OK
    }
  }
}