import { ComponentRef, Injectable } from '@angular/core';
import { Board, Position, Tile } from '../shared';

@Injectable({
  providedIn: 'root',
})
export class BoardService {
  data: Tile[][] = [];
  createTile: (board: Board, position: Position) => ComponentRef<Tile>;
  destroyTile: (data: Tile) => void;
  rows: number;
  columns: number;
  height: number;
  width: number;

  constructor() {}

  create(board: Board, { createTile, destroyTile }) {
    this.data = [];
    this.rows = board.rows;
    this.columns = board.columns;
    this.width = board.width;
    this.height = board.height;
    this.createTile = createTile;
    this.destroyTile = destroyTile;

    for (let row = 0; row < this.rows; row++) {
      this.data[row] = [];
      for (let column = 0; column < this.columns; column++) {
        this.crateAt({ row, column });
      }
    }
  }

  update(board: Board) {
    this.width = board.width;
    this.height = board.height;
    for (let row = 0; row < this.data.length; row++) {
      const columns = this.data[row];
      for (let column = 0; column < columns.length; column++) {
        const tile = this.getAt({ row, column });
        if (tile) {
          const width = board.width / board.columns;
          const height = board.height / board.rows;
          Object.assign(tile, { width, height });
        }
      }
    }
  }

  crateAt(position: Position) {
    const ref = this.createTile(this, position);
    this.setAt(position, ref.instance);
    return ref.instance;
  }

  setAt({ row, column }: Position, data: Tile) {
    if (!Array.isArray(this.data[row])) {
      this.data[row] = [];
    }
    this.data[row][column] = data;
  }

  getAt(position: Position): Tile {
    return (this.data[position.row] || [])[position.column];
  }

  getAllRow(row: number) {
    const data = [];
    for (let column = 0; column < this.columns; column++) {
      const tile = this.getAt({ row, column });
      if (tile) {
        data.push(tile);
      }
    }
    return data;
  }

  getAllColumn(column: number) {
    const data = [];
    for (let row = 0; row < this.rows; row++) {
      const tile = this.getAt({ row, column });
      if (tile) {
        data.push(tile);
      }
    }
    return data;
  }

  getAllType(type: string) {
    const data = [];
    for (let row = 0; row < this.data.length; row++) {
      const columns = this.data[row];
      for (let column = 0; column < columns.length; column++) {
        const tile = this.getAt({ row, column });
        if (tile && tile.type === type) {
          data.push(tile);
        }
      }
    }
    return data;
  }

  removeAt({ row, column }: Position) {
    this.data[row][column] = null;
  }

  destroyData(data: Tile) {
    this.destroyTile(data);
  }

  isAdjacent(source: Position, target: Position) {
    if (
      !target ||
      !source ||
      (source.column !== target.column && source.row !== target.row) ||
      (source.column === target.column && source.row === target.row)
    ) {
      return false;
    }
    const column = Math.abs(target.column - source.column);
    const row = Math.abs(target.row - source.row);
    return Math.max(column, row) <= 1;
  }
}
