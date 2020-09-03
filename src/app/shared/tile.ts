import { Observable } from 'rxjs';
import { Position } from './position';

export enum TileState {
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
  state: TileState;
  alive?: boolean;
  idle?: boolean;
  die(): Observable<void>;
  shift(target: Position): Observable<void>;
}
