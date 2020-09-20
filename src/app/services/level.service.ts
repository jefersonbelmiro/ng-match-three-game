import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { Level, Monsters } from '../shared';
import { StateService } from './state.service';

const LEVEL_DATA = [
  {
    current: 0,
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
    current: 1,
    moves: 20,
    types: [0, 1, 2, 3],
    target: {
      types: [1],
      size: 20,
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
    moves: 30,
    types: [0, 1, 2, 3],
    target: {
      types: [2, 3],
      size: 15,
    },
    tiles: [
      [3, 1, 0, 2, 2],
      [0, 1, 3, 1, 3],
      [2, 0, 1, 2, 1],
      [0, 1, 2, 0, 3],
      [0, 3, 1, 3, 3],
    ],
  },
  {
    current: 3,
    moves: 30,
    types: [1, 2, 3, 4],
    target: {
      types: [4],
      size: 30,
    },
    tiles: [
      [2, 0, 1, 1, 0],
      [0, 1, 4, 0, 3],
      [3, 0, 3, 2, 1],
      [0, 1, 2, 0, 4],
      [0, 4, 1, 4, 3],
    ],
  },
  {
    current: 4,
    moves: 30,
    types: [1, 2, 3, 4],
    target: {
      types: [2, 3, 4],
      size: 20,
    },
    tiles: [
      [2, 0, 1, 1, 0],
      [0, 1, 4, 0, 3],
      [3, 0, 3, 2, 1],
      [0, 1, 2, 0, 4],
      [0, 4, 1, 4, 3],
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
    let current = this.getValue()?.current || 0;
    if (this.getValue()?.complete) {
      current += 1;
    }
    const data = LEVEL_DATA[current];
    const { moves, tiles, types } = data;

    const target = data.target.types.map((typeIndex) => {
      return {
        type: monsters[typeIndex],
        remain: data.target.size,
      };
    });

    this.set({
      score: 0,
      complete: false,
      current,
      moves,
      target,
      tiles,
      types,
    });
  }

  set(data: Partial<Level>) {
    const current = this.getValue();
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
    if (found.remain > 0) {
      found.remain -= length;
    }
    const total = target.reduce((remain, item) => item.remain + remain, 0);
    this.set({ target, complete: total === 0 });
  }

  updateScore(value: number) {
    const score = this.getValue().score + value;
    this.set({ score });
  }

  updateCurrent() {
    const current = this.getValue().current + 1;
    this.set({ current });
  }
}
