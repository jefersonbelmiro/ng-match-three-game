import { Injectable, ComponentRef } from '@angular/core';
import { Board, getTileSize, Monsters, Position, Tile, Level } from '../shared';
import { TileService } from './tile.service';

const monsters = Object.keys(Monsters);

@Injectable({
  providedIn: 'root',
})
export class BoardService {
  data: Tile[][] = [];
  rows: number;
  columns: number;
  height: number;
  width: number;
  types: number[];
  createTile: (
    board: Board,
    position: Position,
    type: string
  ) => ComponentRef<Tile>;
  destroyTile: (data: Tile) => void;

  constructor() {}

  create(board: Board, levelData: Level, { createTile, destroyTile }) {
    this.data = [];
    this.rows = board.rows;
    this.columns = board.columns;
    this.width = board.width;
    this.height = board.height;
    this.types = levelData.types;
    this.createTile = createTile;
    this.destroyTile = destroyTile;

    const typeIndex = levelData.tiles;
    for (let row = 0; row < typeIndex.length; row++) {
      this.data[row] = [];
      for (let column = 0; column < typeIndex[row].length; column++) {
        const index = typeIndex[row][column];
        this.crateAt({ row, column }, monsters[index]);
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
          Object.assign(tile, getTileSize(board));
        }
      }
    }
  }

  crateAt(position: Position, type?: string) {
    if (!type) {
      const typeIndex = this.types[Math.floor(Math.random() * this.types.length)];
      type = monsters[typeIndex];
    }
    const ref = this.createTile(this, position, type);
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
