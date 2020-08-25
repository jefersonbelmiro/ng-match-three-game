import { Injectable, ComponentRef } from '@angular/core';
import { Position, Board, Tile } from '../shared';

interface TileFactory {
  (position: Position): ComponentRef<Tile>;
}

@Injectable({
  providedIn: 'root',
})
export class BoardService {
  data: Tile[][] = [];
  dataRef: WeakMap<Tile, ComponentRef<Tile>>;
  tileFactory: TileFactory;
  rows: number;
  columns: number;

  constructor() {}

  create({ rows, columns }: Board, tileFactory: TileFactory) {
    this.data = [];
    this.dataRef = new WeakMap();
    this.tileFactory = tileFactory;
    this.rows = rows;
    this.columns = columns;

    for (let row = 0; row < this.rows; row++) {
      this.data[row] = [];
      for (let column = 0; column < this.columns; column++) {
        this.crateAt({ row, column });
      }
    }
  }

  getData() {
    return this.data;
  }

  crateAt(position: Position) {
    const ref = this.tileFactory(position);
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
