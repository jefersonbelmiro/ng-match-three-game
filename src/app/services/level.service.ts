import { Injectable } from '@angular/core';
import { Colors, Store } from '../shared';

interface State {
  moves: number;
  score: number;
  level: number;
  target: {
    type: Colors;
    remain: number;
  }[];
}

const INITIAL_STATE = {
  moves: 0,
  score: 0,
  level: 0,
  target: [],
};

@Injectable({
  providedIn: 'root',
})
export class LevelService extends Store<State> {
  constructor() {
    super(INITIAL_STATE);
  }

  create() {
    const current = this.getValue();
    const level = current.level + 1;
    const moves = Math.ceil(level / 2) * 10;

    const target = [];
    const types = Object.keys(Colors).sort(() => Math.random() - 0.5);
    const length = Math.min(Math.ceil(level + 2), types.length);

    for (let index = 0; index < length; index++) {
      const type = types[index % types.length];
      target.push({
        type,
        remain: Math.ceil(level / 2) * 6,
      });
    }

    this.set({ level, moves, target });
  }

  set(data: Partial<State>) {
    this.setState({ ...this.getValue(), ...data });
  }

  updateMoves() {
    const moves = this.getValue().moves - 1;
    this.set({ moves });
  }

  isTargetType(type: Colors) {
    const target = this.getValue().target;
    return target.find((item) => item.type === type);
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

  updateScore() {
    const score = this.getValue().score + 1;
    this.set({ score });
  }
}
