import { Observable } from 'rxjs';
import { Position } from './position';
import { Sprite } from './sprite';
import { Board } from '.';

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
  shift(
    target: Position,
    options?: { fallingAnimatin: boolean }
  ): Observable<void>;
}

export const getTileSize = (board: Board) => {
  const size = Math.min(board.width, board.height);
  const length = Math.max(board.rows, board.columns);
  const height = size / length;
  const width = size / length;
  return { width, height };
};
