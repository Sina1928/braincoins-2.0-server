import { RowDataPacket, ResultSetHeader } from "mysql2";

export interface DBUser extends RowDataPacket {
  id: number;
  username: string;
  email: string;
  password: string;
}

export interface DBBalance extends RowDataPacket {
  id: number;
  user_id: number;
  umer_coins: number;
  mark_bucks: number;
  kcoins: number;
  corgi_coins: number;
  neo_coins: number;
}

export interface DBQueryResult<T> extends Array<T> {
  [0]: T;
}

export interface InsertResult extends ResultSetHeader {
  insertId: number;
}
