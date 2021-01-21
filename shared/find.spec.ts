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
});
