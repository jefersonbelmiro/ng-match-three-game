import { apply, fill, matchesToUpdate, shift } from './board';
import { find } from './find';

describe('fill', () => {
  it('should shift tiles', () => {
    const board = [
      [1, 0, 2],
      [1, -1, 2],
      [1, 0, 2],
    ];
    const pool = [3];
    const updated = fill(board, pool);

    expect(updated).toStrictEqual([
      {
        type: 'shift',
        source: { row: 0, column: 1 },
        target: { row: 1, column: 1 },
      },
      {
        type: 'new',
        source: { row: -1, column: 1, type: 3 },
        target: { row: 0, column: 1 },
      },
    ]);
  });
});

describe('shift', () => {
  it('should shift positions', () => {
    const board = [
      [0, 0, 0],
      [0, 1, 0],
      [0, 2, 0],
    ];
    const source = { row: 1, column: 1 };
    const target = { row: 2, column: 1 };

    const result = shift(source, target, board);

    expect(result).toStrictEqual([
      [0, 0, 0],
      [0, 2, 0],
      [0, 1, 0],
    ]);
    expect(board).toStrictEqual([
      [0, 0, 0],
      [0, 1, 0],
      [0, 2, 0],
    ]);
  });
});

describe('apply', () => {
  it('should apply updates', () => {
    let board = [
      [0, 1, 0],
      [1, 2, 1],
      [0, 2, 0],
    ];
    const source = { row: 0, column: 1 };
    const target = { row: 1, column: 1 };

    const pool = [3, 3, 3];
    board = shift(source, target, board);
    const matches = find(board);
    board = apply(matchesToUpdate(matches), board);
    board = apply(fill(board, pool), board);

    expect(board).toStrictEqual([
      [3, 3, 3],
      [0, 2, 0],
      [0, 2, 0],
    ]);
  });
});
