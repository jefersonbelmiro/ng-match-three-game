import { Injectable } from '@angular/core';
import {
  Store,
  Tile,
  PowerUp,
  PowerUps,
  Level,
  MultiplayerData,
} from '../shared';

const initialStateFactory = () => ({
  scene: 'menu' as const,
  busy: 0,
  powerUps: [
    {
      type: PowerUps.VerticalArrow,
      value: 99,
    },
    {
      type: PowerUps.HorizontalArrow,
      value: 99,
    },
    {
      type: PowerUps.Star,
      value: 99,
    },
    {
      type: PowerUps.Axe,
      value: 99,
    },
  ],
});

export interface State {
  scene: 'menu' | 'level' | 'lobby' | 'play';
  busy: number;
  selected?: Tile;

  selectedPowerUp?: PowerUp;
  powerUps?: PowerUp[];

  level?: Level;

  multiplayer?: MultiplayerData;
}

@Injectable({
  providedIn: 'root',
})
export class StateService extends Store<State> {
  busyQuery = [];

  constructor() {
    super(initialStateFactory());
  }

  setBusy(busy: boolean, force = false) {
    let current = force ? +busy : this.getValue().busy;
    current += busy ? 1 : -1;
    if (current < 0) {
      current = 0;
    }
    this.set({ busy: current });
  }

  isBusy() {
    let { busy } = this.getValue();
    if (busy === 0 && this.busyQuery.length) {
      busy = +this.busyQuery.some((query) => query());
    }
    return busy > 0;
  }

  setBusyQuery(queries: (() => boolean)[]) {
    this.busyQuery = queries;
  }
}
