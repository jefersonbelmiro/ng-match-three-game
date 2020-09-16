import { Injectable } from '@angular/core';
import { Store, Tile, PowerUp, PowerUps } from '../shared';

const INITIAL_STATE = {
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
    }
  ]
};

export interface State {
  busy: number;
  selected?: Tile;

  selectedPowerUp?: PowerUp;
  powerUps?: PowerUp[];
}

@Injectable({
  providedIn: 'root',
})
export class StateService extends Store<State> {
  constructor() {
    super(INITIAL_STATE);
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
