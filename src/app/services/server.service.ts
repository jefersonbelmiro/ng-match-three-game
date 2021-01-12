import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { User } from 'firebase';
import {
  EMPTY,
  from,
  Observable,
  ReplaySubject,
  Subscriber,
  Subscription,
} from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from './auth.service';

type EventType = firebase.database.EventType;
type DataSnapshot = firebase.database.DataSnapshot;
type Reference = firebase.database.Reference;

@Injectable({
  providedIn: 'root',
})
export class ServerService {
  changes = {
    user: new ReplaySubject(1),
    game: new ReplaySubject(1),
    players: new ReplaySubject(1),
    board: new ReplaySubject(1),
    turn: new ReplaySubject(1),
    playersStates: new ReplaySubject(1),
    updates: new ReplaySubject(1),
  };

  private user: User;
  private gameId: string;
  private refCommands: Reference;
  private refs = new Map<string, Subscription>();
  private destroyed$ = new ReplaySubject(1);

  constructor(
    private auth: AuthService,
    private firebase: AngularFireDatabase
  ) {
    this.auth.userDataObservable.pipe(takeUntil(this.destroyed$)).subscribe((user) => {
      console.log('subscribe userData observable', { user });
      if (user && this.user !== user) {
        this.onLogin(user);
      }
    });
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
    this.removeListeners();
  }

  loginAnonymously() {
    return this.auth.loginAnonymously();
  }

  loginWithGoogle() {
    return this.auth.loginWithGoogle();
  }

  signOut() {
    return this.auth.signOut();
  }

  setPlayerData(data: { displayName?: string; photoURL?: string }) {
    this.ref(`/players/{uid}`).update(data);
  }

  setReady() {
    const uid = this.user.uid;
    const gameId = this.gameId;
    this.refCommands.push({ command: 'ready', gameId });
    console.log('ready', { uid, gameId });
  }

  pushCommand(payload: { command?: string }) {
    return from(this.refCommands.push(payload));
  }

  removeCommands() {
    const uid = this.user?.uid;
    if (uid) {
      return from(this.ref(`/commands/${uid}`).remove());
    }
    return EMPTY;
  }

  on(path: string, type: EventType = 'value') {
    return new Observable((subscriber: Subscriber<any>) => {
      const onValue = (snapshot: DataSnapshot) => {
        subscriber.next(snapshot.val());
      };
      const onError = (error: Error) => {
        subscriber.error(error);
      };
      const ref = this.ref(path);
      ref.on(type, onValue, onError);
      return () => {
        ref.off(type, onValue);
      };
    });
  }

  once<T = any>(path: string, type: EventType = 'value') {
    return new Observable((subscriber: Subscriber<T>) => {
      const onValue = (snapshot: DataSnapshot) => {
        subscriber.next(snapshot.val());
        subscriber.complete();
      };
      const onError = (error: Error) => {
        subscriber.error(error);
      };
      this.ref(path).once(type).then(onValue, onError);
    });
  }

  ref(path: string) {
    const pathResolved = this.pathResolve(path);
    return this.firebase.database.ref(pathResolved);
  }

  private listen<T = any>(
    path: string,
    handler: (value: T) => void,
    type: EventType = 'value'
  ) {
    if (this.refs.has(path)) {
      this.refs.get(path).unsubscribe();
    }
    const subscription = this.on(path, type).subscribe(handler, (error) => {
      console.log('error:listen', path, error);
    });
    this.refs.set(path, subscription);
  }

  private onLogin(user: User) {
    console.log('onLogin', { user });
    this.user = user;
    this.changes.user.next(user);

    this.listen('/players_states/{uid}', this.onPlayerStateChanges);

    this.refCommands = this.ref('/commands/{uid}');

    this.setPlayerData({
      displayName: user.displayName || null,
      photoURL: user.photoURL || null,
    });
  }

  private removeListeners() {
    Object.keys(this.refs).forEach((key) => this.refs[key].unsubscribe());
    this.refs.clear();
  }

  private onPlayerStateChanges = (state: any) => {
    console.log('onPlayerStateChanges', state);
    this.changes.playersStates.next(state);

    if (state?.gameId && state.gameId !== this.gameId) {
      this.gameId = state.gameId;
      this.listen('/games/{gameId}', (value) => {
        this.changes.game.next(value);
      });
      this.listen('/games/{gameId}/board', (value) => {
        this.changes.board.next(value);
      });
      this.listen('/games/{gameId}/turn', (value) => {
        this.changes.turn.next(value);
      });
      this.listen(
        '/games/{gameId}/updates',
        (value) => {
          this.changes.updates.next(value);
        },
        'child_added'
      );
    }
  };

  private pathResolve(path: string) {
    if (path.includes('{uid}') && !this.user?.uid) {
      throw new Error('pathResolve: user uid not defined');
    }
    if (path.includes('{gameId}') && !this.gameId) {
      throw new Error('pathResolve: gameId not defined');
    }
    return path
      .replace('{gameId}', this.gameId)
      .replace('{uid}', this.user?.uid);
  }
}
