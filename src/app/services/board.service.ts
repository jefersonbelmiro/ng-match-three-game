import { ComponentRef, Injectable, ViewContainerRef } from '@angular/core';
import { Board, Position, Tile } from '../shared';
import { TileService } from './tile.service';

@Injectable({
  providedIn: 'root',
})
export class BoardService {
  data: Tile[][] = [];
  dataRef: WeakMap<Tile, ComponentRef<Tile>>;
  createTileFactory: (
    board: Board
  ) => (position: Position) => ComponentRef<Tile>;
  updateTileFactory: (board: Board) => (position: Position) => Tile;

  createTile: (position: Position) => ComponentRef<Tile>;
  updateTile: (data: Partial<Tile>) => Tile;
  rows: number;
  columns: number;
  height: number;
  width: number;

  constructor() {}

  create(board: Board, { createTileFactory, updateTileFactory }) {
    this.data = [];
    this.dataRef = new WeakMap();
    this.rows = board.rows;
    this.columns = board.columns;
    this.width = board.width;
    this.height = board.height;
    this.createTileFactory = createTileFactory;
    this.updateTileFactory = updateTileFactory;

    this.createTile = this.createTileFactory(board);
    this.updateTile = this.updateTileFactory(board);

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
    this.updateTile = this.updateTileFactory(board);
    this.createTile = this.createTileFactory(board);
    for (let row = 0; row < this.data.length; row++) {
      const columns = this.data[row];
      for (let column = 0; column < columns.length; column++) {
        this.updateAt({ row, column }, this.getAt({ row, column }));
      }
    }
  }

  updateAt(position: Position, data: Partial<Tile>) {
    const tile = this.getAt(position);
    if (tile) {
      Object.assign(tile, this.updateTile(data));
    }
  }

  crateAt(position: Position) {
    const ref = this.createTile(position);
    this.setAt(position, ref.instance);
    this.dataRef.set(ref.instance, ref);
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

  removeAt({ row, column }: Position) {
    const data = this.getAt({ row, column });
    const ref = this.dataRef.get(data);
    if (ref) {
      ref.destroy();
    }
    this.data[row][column] = null;
  }
}
