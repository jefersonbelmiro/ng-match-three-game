import { Injectable } from '@angular/core';
import { Store } from '../shared';

const INITIAL_STATE = {
  busy: 0,
};

export interface State {
  busy: number;
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
    this.setState({ busy: current });
  }

  isBusy() {
    return this.getValue().busy > 0;
  }
}
