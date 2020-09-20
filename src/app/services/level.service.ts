import { Injectable } from '@angular/core';
import { Level, Tile, Monsters } from '../shared';
import { StateService } from './state.service';
import { map } from 'rxjs/operators';

const LEVEL_DATA = [
  {
    current: 1,
    moves: 10,
    types: [0, 1, 2, 3],
    target: {
      types: [0],
      size: 10,
    },
    tiles: [
      [0, 1, 0, 2, 2],
      [0, 1, 2, 1, 1],
      [2, 0, 1, 2, 1],
      [0, 1, 2, 0, 0],
      [0, 2, 1, 0, 1],
    ],
  },
  {
    current: 2,
    moves: 10,
    types: [0, 1, 2, 3, 4],
    target: {
      types: [1],
      size: 30,
    },
    tiles: [
      [0, 1, 0, 2, 2],
      [0, 1, 2, 1, 1],
      [2, 0, 1, 2, 1],
      [0, 1, 2, 0, 0],
      [0, 2, 1, 0, 1],
    ],
  },
];

const monsters = Object.keys(Monsters);

@Injectable({
  providedIn: 'root',
})
export class LevelService {
  constructor(private state: StateService) {}

  create() {
    const current = 0;
    const data = LEVEL_DATA[current];
    const { moves, tiles, types } = data;

    const target = data.target.types.map((typeIndex) => {
      return {
        type: monsters[typeIndex],
        remain: data.target.size,
      };
    });

    this.set({ score: 0, current, moves, target, tiles, types });
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

  isTargetType(type: string) {
    const target = this.getValue().target;
    return target.find((item) => item.type === type && item.remain > 0);
  }

  updateTarget(type: string, length: number) {
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
}
