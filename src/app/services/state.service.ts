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
  constructor() {
    super(initialStateFactory());
  }

  setBusy(busy: boolean) {
    let current = this.getValue().busy;
    current += busy ? 1 : -1;
    if (current < 0) {
      current = 0;
    }
    this.set({ busy: current });
  }

  isBusy() {
    return this.getValue().busy > 0;
  }
}
