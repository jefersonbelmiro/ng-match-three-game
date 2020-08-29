import { Injectable } from '@angular/core';
import { BoardService } from './board.service';
import { Tile } from '../shared';

interface BoardMove {
  row: Moves;
  column: Moves;
}

enum Moves {
  Forward = 1,
  Backward = -1,
  Idle = 0,
}

const moves = {
  left: { row: Moves.Idle, column: Moves.Backward },
  right: { row: Moves.Idle, column: Moves.Forward },
  above: { row: Moves.Backward, column: Moves.Idle },
  below: { row: Moves.Forward, column: Moves.Idle },
};

@Injectable({
  providedIn: 'root',
})
export class MatchService {
  constructor(private board: BoardService) {}

  find(target?: Tile): Tile[] {
    if (target) {
      return this.getSameType(target);
    }
    const data = this.board.data;
    const matches = [];
    for (let row = 0; row < data.length; row++) {
      const columns = data[row];
      for (let column = 0; column < columns.length; column++) {
        const tile = this.board.getAt({ row, column });
        if (matches.includes(tile)) {
          continue;
        }
        matches.push(...this.getSameType(tile));
      }
    }
    return matches;
  }

  private getSameType(tile: Tile) {
    const horizontal = [
      ...this.getSameTypeByDirection(tile, moves.left),
      ...this.getSameTypeByDirection(tile, moves.right),
    ];
    const vertical = [
      ...this.getSameTypeByDirection(tile, moves.above),
      ...this.getSameTypeByDirection(tile, moves.below),
    ];
    const result = [];
    if (horizontal.length >= 2) {
      result.push(...horizontal);
    }
    if (vertical.length >= 2) {
      result.push(...vertical);
    }
    return result.length ? [tile, ...result] : [];
  }

  private getSameTypeByDirection(tile: Tile, moves: BoardMove) {
    if (!tile.alive) {
      return [];
    }
    const result = [];
    let row = tile.row + moves.row;
    let column = tile.column + moves.column;
    const valid = () => {
      return (
        row >= 0 &&
        column >= 0 &&
        row < this.board.rows &&
        column < this.board.columns
      );
    };

    while (valid()) {
      const findTile = this.board.getAt({ row, column });
      if (!findTile || findTile.type !== tile.type || !findTile.alive) {
        break;
      }
      result.push(findTile);
      row += moves.row;
      column += moves.column;
    }

    return result;
  }
}
