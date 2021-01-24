import { find } from './find';

describe('find', () => {
  it('should find by target', () => {
    const board = [
      [1, 0, 2],
      [1, 0, 2],
      [1, 0, 2],
    ];
    const target = { row: 0, column: 0 };
    const matches = find(board, target);

    expect(matches).toStrictEqual([
      { row: 0, column: 0, type: 1 },
      { row: 1, column: 0, type: 1 },
      { row: 2, column: 0, type: 1 },
    ]);
  });

  it('should find all matches', () => {
    const board = [
      [1, 1, 1],
      [1, 0, 0],
      [1, 0, 0],
    ];
    const matches = find(board);

    expect(matches).toStrictEqual([
      { row: 0, column: 0, type: 1 },
      { row: 0, column: 1, type: 1 },
      { row: 0, column: 2, type: 1 },
      { row: 1, column: 0, type: 1 },
      { row: 2, column: 0, type: 1 },
    ]);
  });
});
