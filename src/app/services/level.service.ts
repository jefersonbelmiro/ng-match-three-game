import { Injectable } from '@angular/core';
import { Colors, Level, Tile } from '../shared';
import { StateService } from './state.service';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class LevelService {
  constructor(private state: StateService) {}

  create(boardData: Tile[][]) {
    const level = 1;
    const moves = Math.ceil(level / 2) * 10 * 10;

    const target = [];
    const types = this.extractTypes(boardData);
    const length = 2; //Math.min(Math.ceil(level), types.length);

    for (let index = 0; index < length; index++) {
      const type = types[index % types.length];
      target.push({
        type,
        remain: Math.ceil(level / 2) * 6 * 3,
      });
    }

    this.set({ score: 0, level, moves, target });
  }

  set(data: Partial<Level>) {
    const current = this.state.getValue().level;
    this.state.set({ level: { ...current, ...data } });
  }

  getValue() {
    return this.state.getValue().level;
  }

  getState() {
    return this.state.getState().pipe(map((state) => state.level));
  }

  updateMoves() {
    const moves = this.getValue().moves - 1;
    this.set({ moves });
  }

  isTargetType(type: Colors) {
    const target = this.getValue().target;
    return target.find((item) => item.type === type && item.remain > 0);
  }

  updateTarget(type: Colors, length: number) {
    const target = this.getValue().target.slice();
    const found = target.find((item) => item.type === type);
    if (!found) {
      return;
    }
    found.remain -= length;
    this.set({ target });
  }

  updateScore(value: number) {
    const score = this.getValue().score + value;
    this.set({ score });
  }

  private extractTypes(data: Tile[][], slice = 0) {
    const types = [];
    for (let row = 0; row < data.length; row++) {
      const columns = data[row];
      for (let column = 0; column < columns.length; column++) {
        const data = columns[column] as Tile;
        if (!types.includes(data.type)) {
          types.push(data.type);
        }
      }
    }

    return types.sort(() => Math.random() - 0.5).slice(slice);
  }
}
