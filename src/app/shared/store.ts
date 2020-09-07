import { BehaviorSubject, Observable } from 'rxjs';

export class Store<T = any> {
  protected state: BehaviorSubject<T>;
  protected state$: Observable<T>;

  protected constructor(initialState: T) {
    this.state = new BehaviorSubject(initialState);
    this.state$ = this.state.asObservable();
  }

  getValue() {
    return this.state.getValue();
  }

  getState(): Observable<T> {
    return this.state;
  }

  setState(next: T): void {
    this.state.next(next);
  }

  set(data: Partial<T>) {
    this.setState({ ...this.getValue(), ...data });
  }
}
