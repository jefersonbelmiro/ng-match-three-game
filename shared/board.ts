import { TYPES_INDEX } from './server';

export const BOARD_ROWS = 5;
export const BOARD_COLUMNS = 5;

export interface BoardMove {
  row: Moves;
  column: Moves;
}

export enum Moves {
  Forward = 1,
  Backward = -1,
  Idle = 0,
}

export const MOVES = {
  left: { row: Moves.Idle, column: Moves.Backward },
  right: { row: Moves.Idle, column: Moves.Forward },
  above: { row: Moves.Backward, column: Moves.Idle },
  below: { row: Moves.Forward, column: Moves.Idle },
};

export interface Tile {
  type?: number;
  row: number;
  column: number;
}

function getRandomType() {
  return TYPES_INDEX[Math.floor(Math.random() * TYPES_INDEX.length)];
}

export function createBoard() {
  const data: number[][] = [];
  for (let row = 0; row < 5; row++) {
    data[row] = [];
    for (let column = 0; column < 5; column++) {
      data[row][column] = getRandomType();
    }
  }
  return data;
}

export function getAt(target: Tile, board: number[][]) {
  const { row, column } = target;
  if (!board[row]) {
    return null;
  }
  const type = board[row][column];
  if (type === null || type === -1) {
    return null;
  }
  return { ...target, type };
}

export function setAt({ row, column }: Tile, data: number, board: number[][]) {
  if (!board[row]) {
    board[row] = [];
  }
  board[row][column] = data;
}

export function shift(source: Tile, target: Tile, board: number[][]) {
  const sourceType = getAt(source, board)?.type || -1;
  const targetType = getAt(target, board)?.type || -1;
  setAt(source, targetType, board);
  setAt(target, sourceType, board);
}
