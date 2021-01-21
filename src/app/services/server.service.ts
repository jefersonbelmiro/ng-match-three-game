import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import {
  BehaviorSubject,
  EMPTY,
  from,
  Observable,
  ReplaySubject,
  Subscriber,
  Subscription,
} from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Command, Game, Player, PlayerState, Update } from '@shared/server';
import { EventType, DataSnapshot, Reference, User } from '../shared/firebase';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class ServerService {
  changes = {
    user: new ReplaySubject<User>(1),
    game: new ReplaySubject<Game>(1),
    players: new ReplaySubject<Player>(1),
    board: new BehaviorSubject<number[][]>([]),
    turn: new ReplaySubject<string>(1),
    playersStates: new ReplaySubject<PlayerState>(1),
    updates: new ReplaySubject<Update>(1),
  };

  private user: User;
  private gameId: string;
  private refCommands: Reference;
  refs = new Map<string, Subscription>();
  private destroyed$ = new ReplaySubject(1);

  constructor(
    private auth: AuthService,
    private firebase: AngularFireDatabase
  ) {
    this.auth.userDataObservable
      .pipe(takeUntil(this.destroyed$))
      .subscribe((user) => {
        console.log('userDataObservable', { user });
        const diff = this.user !== user;
        this.user = user;
        this.changes.user.next(user);

        if (user && diff) {
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

  pushCommand(payload: Command) {
    return from(this.refCommands.push(payload));
  }

  removeCommands() {
    const uid = this.user?.uid;
    console.log('removeCommands', `/commands/${uid}`);
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
        console.log('OFF', path);
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
      this.listen('/games/{gameId}/turnId', (value) => {
        this.changes.turn.next(value);
      });
      // this.listen(
      //   '/games/{gameId}/updates',
      //   (value) => {
      //     this.changes.updates.next(value);
      //   },
      //   'child_added'
      // );

      this.ref('/games/{gameId}/updates')
        .orderByChild('timestamp')
        .startAt(Date.now())
        .on('child_added', (snapshot) => {
          this.changes.updates.next(snapshot.val());
        });
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
