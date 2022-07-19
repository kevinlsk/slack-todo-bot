import { initializeApp, cert } from 'firebase-admin/app';
import admin from 'firebase-admin';
import { getFirestore, CollectionReference, DocumentData } from 'firebase-admin/firestore';
import { Logger } from "@slack/bolt";

export interface DBService {
  upsert(data: any): Promise<DBServiceResult>;
  list(): Promise<any[]>;
  listByStatus(value: string): Promise<any[]>;
  deleteById(id: string): Promise<DBServiceResult>;
}

export interface DBServiceResult {
  status: DBServiceStatus,
  error?: string
}

export enum DBServiceStatus {
  OK,
  FAILED
}

export function DBServiceCreate(user: string, logger: Logger): DBService {
  return new FirebaseDBService(user, logger);
}

const serviceAccount = require(process.env.GOOGLE_APPLICATION_CREDENTIALS as string);
initializeApp({
  credential: cert(serviceAccount)
});
const db = getFirestore();

class FirebaseDBService implements DBService {
  private todos: CollectionReference;
  private logger: Logger;
  private user: string;

  constructor(user: string, logger: Logger) {
    this.logger = logger;
    this.user = user;
    this.todos = db.collection('users').doc(user).collection('todos');
  }

  public async upsert(data: any): Promise<DBServiceResult> {
    try {
      const id = data.id;
      if (!id) {
        throw new Error(`DBFirebaseService.upsert() id not defined: data=${JSON.stringify(data)}`);
      }

      data.timestamp = admin.firestore.FieldValue.serverTimestamp();
      const result = await this.todos.doc().set(data, {merge: true});
      this.logger.debug(result);
      return {
        status: DBServiceStatus.OK
      };
    } catch (err: any) {
      this.logger.error(err);

      return {
        status: DBServiceStatus.FAILED,
        error: err.message
      };
    }
  }

  public async listByStatus(value: string): Promise<DocumentData[]> {
    const dataSet = await this.todos.where("status", "==", value).orderBy("timestamp").get();
    return dataSet.docs;
  }

  public async list(): Promise<DocumentData[]> {
    const dataSet = await this.todos.orderBy("timestamp").get();
    return dataSet.docs;
  }

  public async deleteById(id: string): Promise<DBServiceResult> {
    try {
      const result = await this.todos.doc(id).delete();
      this.logger.debug(result);
      return {
        status: DBServiceStatus.OK
      };
    } catch (err) {
      return {
        status: DBServiceStatus.FAILED,
        error: JSON.stringify(err)
      };
    }
  }
}