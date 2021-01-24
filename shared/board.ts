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

export function setAt(
  { row, column }: Position,
  data: number,
  board: number[][]
) {
  if (!Array.isArray(board[row])) {
    board[row] = [];
  }
  board[row][column] = data;
}

export function createAt(
  position: Position,
  data: number,
  board: number[][]
) {
  setAt(position, data, board);
  return getAt(position, board);
}

export function shift(source: Position, target: Position, board: number[][]) {
  const sourceType = getAt(source, board)?.type ?? -1;
  const targetType = getAt(target, board)?.type ?? -1;
  setAt(source, targetType, board);
  setAt(target, sourceType, board);
}

export function createPool(length = 100) {
  const data: number[] = [];
  for (let index = 0; index < length; index++) {
    data[index] = getRandomType();
  }
  return data;
}

export function fill(board: number[][], pool: number[]) {
  const updates = [];
  for (let column = 0; column < board.length; column++) {
    let shift = 0;
    const shiftData = [];
    const rows = board[column].length;
    for (let row = rows - 1; row >= 0; row--) {
      const tile = getAt({ row, column }, board);
      if (!tile) {
        shiftData.push({ row: shift, column });
        shift++;
        continue;
      }
      if (shift > 0) {
        updates.push({ type: 'shift', row: row + shift, column });
      }
    }
    shiftData.forEach(({ row, column }) => {
      const type = pool.shift() as number;
      const source = createAt({ row: row - shift, column }, type, board);
      updates.push({
        type: 'new',
        source,
        target: { row, column }
      });
    });
  }
}
