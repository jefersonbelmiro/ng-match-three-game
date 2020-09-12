import { Observable } from 'rxjs';
import { Position } from './position';
import { Sprite } from './sprite';

export enum TileState {
  Idle = 'idle',
  Shift = 'shift',
  Dead = 'dead',
}

export interface Tile extends Sprite {
  row: number;
  column: number;
  width: number;
  height: number;
  type: string;
  state: TileState;
  alive?: boolean;
  idle?: boolean;
  die(animation?: 'die' | 'target'): Observable<void>;
  shift(target: Position): Observable<void>;
}
