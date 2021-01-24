import { Update } from './server';

export const TYPES_INDEX = [0, 1, 2, 3];

export interface Position {
  row: number;
  column: number;
}

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

export interface Tile extends Position {
  type?: number;
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

export function getAt(target: Position, board: number[][]): Tile | null {
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

export function setAt(position: Position, data: number, board: number[][]) {
  const { row, column } = position;
  if (!Array.isArray(board[row])) {
    board[row] = [];
  }
  board[row][column] = data;
}

export function createAt(position: Position, data: number, board: number[][]) {
  setAt(position, data, board);
  return getAt(position, board);
}

export function shift(source: Position, target: Position, board: number[][]) {
  const sourceType = getAt(source, board)?.type ?? -1;
  const targetType = getAt(target, board)?.type ?? -1;
  const data = from(board);
  setAt(source, targetType, data);
  setAt(target, sourceType, data);
  return data;
}

export function from(board: number[][]) {
  return board.slice().map((row) => {
    return row.slice();
  });
}

export function createPool(length = 100) {
  const data: number[] = [];
  for (let index = 0; index < length; index++) {
    data[index] = getRandomType();
  }
  return data;
}

export function fill(board: number[][], pool: number[]): Update[] {
  const updates = [];
  const rows = board.length;
  const columns = board[0].length;
  for (let column = 0; column < columns; column++) {
    let shiftSize = 0;
    const shiftData = [];
    for (let row = rows - 1; row >= 0; row--) {
      const tile = getAt({ row, column }, board);
      if (!tile) {
        shiftData.push({ row: shiftSize, column });
        shiftSize++;
        continue;
      }
      if (shiftSize > 0) {
        updates.push({
          type: 'shift',
          source: { row, column },
          target: { row: row + shiftSize, column },
        } as Update);
      }
    }
    shiftData.forEach(({ row, column }) => {
      const type = pool.shift() as number;
      updates.push({
        type: 'new',
        source: { row: row - shiftSize, column, type },
        target: { row, column },
      } as Update);
    });
  }
  return updates;
}

export function equal(source: any, target: any) {
  return Object.keys(source).every((key) => {
    if (!(key in source) || !(key in target)) {
      return false;
    }
    return source[key] === target[key];
  });
}

export function matchesToUpdate(matches: Tile[]): Update[] {
  return matches.map(({ row, column }) => {
    return {
      type: 'die',
      target: { row, column },
    };
  });
}

export function apply(updates: Update[], board: number[][]) {
  let data = from(board);

  updates.forEach((update) => {
    if (update.type === 'die') {
      setAt(update.target!, -1, data);
    }
    if (update.type === 'shift') {
      data = shift(update.source!, update.target!, data);
    }
    if (update.type === 'new') {
      setAt(update.target!, update.source?.type!, data);
    }
  });

  return data;
}
