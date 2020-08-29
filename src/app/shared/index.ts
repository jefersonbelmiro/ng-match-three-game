import { Observable } from 'rxjs';

export interface Position {
  row: number;
  column: number;
}

export interface Board {
  rows: number;
  columns: number;
  width: number;
  height: number;
}

export enum Colors {
  Blue = '#2C76F5',
  Red = '#F50C20',
  Pink = '#D95ADB',
  Yellow = '#FADE2A',
  Grey = '#999',
}

export enum States {
  Idle = 'idle',
  Shift = 'shift',
  Dead = 'dead',
}

export interface Tile {
  row: number;
  column: number;
  width: number;
  height: number;
  type: string;
  state: States;
  alive?: boolean;
  idle?: boolean;
  die(): Observable<void>;
  shift(target: Position): Observable<void>;
}

export interface State {
  busy: number;
}

