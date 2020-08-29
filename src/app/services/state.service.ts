import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { State } from '../shared';

const INITIAL_STATE = {
  busy: 0,
};

@Injectable({
  providedIn: 'root',
})
export class StateService {
  state = new BehaviorSubject(INITIAL_STATE);
  state$ = this.state.asObservable();

  constructor() {}

  setState(data: Partial<State>) {
    const current = this.state.value;
    this.state.next({ ...current, ...data });
  }

  getState() {
    return this.state;
  }

  setBusy(busy: boolean) {
    let current = this.state.value.busy;
    current += busy ? 1 : -1;
    if (current < 0) {
      current = 0;
    }
    this.setState({ busy: current });
  }

  isBusy() {
    return this.state.value.busy > 0;
  }
}
