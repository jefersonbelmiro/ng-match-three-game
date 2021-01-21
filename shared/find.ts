import {
  Tile,
  MOVES,
  BoardMove,
  BOARD_ROWS,
  BOARD_COLUMNS,
  getAt,
} from './board';

export function find(board: number[][], position?: { row: number, column: number }) {
  if (position) {
    const target = getAt(position, board);
    if (!target) {
      return [];
    }
    return findSameType(target, board);
  }
  const matches: Tile[] = [];
  for (let row = 0; row < board.length; row++) {
    const columns = board[row];
    for (let column = 0; column < columns.length; column++) {
      const tile = getAt({ row, column }, board);
      if (!tile || matches.includes(tile)) {
        continue;
      }
      matches.push(...findSameType(tile, board));
    }
  }
  return matches;
}

function findSameType(target: Tile, board: number[][]) {
  const horizontal = [
    ...findSameTypeByDirection(target, MOVES.left, board),
    ...findSameTypeByDirection(target, MOVES.right, board),
  ];
  const vertical = [
    ...findSameTypeByDirection(target, MOVES.above, board),
    ...findSameTypeByDirection(target, MOVES.below, board),
  ];
  const result = [];
  if (horizontal.length >= 2) {
    result.push(...horizontal);
  }
  if (vertical.length >= 2) {
    result.push(...vertical);
  }
  return result.length ? [target, ...result] : [];
}

function findSameTypeByDirection(
  target: Tile,
  moves: BoardMove,
  board: number[][]
) {
  const type = getAt(target, board)?.type ?? null;
  if (type === null) {
    return [];
  }
  const result: Tile[] = [];
  let row = target.row + moves.row;
  let column = target.column + moves.column;
  const valid = () => {
    return (
      row >= 0 && column >= 0 && row < BOARD_ROWS && column < BOARD_COLUMNS
    );
  };
  while (valid()) {
    const findTile = getAt({ row, column }, board);
    if (findTile === null || findTile.type !== type) {
      break;
    }
    result.push(findTile);
    row += moves.row;
    column += moves.column;
  }

  return result;
}
