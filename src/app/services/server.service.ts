import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { Command, Game, PlayerState, Update } from '@shared/server';
import { EMPTY, from, Observable, ReplaySubject, Subscriber } from 'rxjs';
import {
  debounceTime,
  filter,
  shareReplay,
  switchMap,
  takeUntil,
  timeout,
} from 'rxjs/operators';
import {
  DataSnapshot,
  EventType,
  Reference,
  User,
  Query,
} from '../shared/firebase';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class ServerService {
  changes: {
    user?: ReplaySubject<User>;
    playersStates?: ReplaySubject<PlayerState>;
    updates?: Observable<Update>;
    game?: Observable<Game>;
    board?: Observable<number[][]>;
    turn?: Observable<string>;
    winner?: Observable<string>;
    pool?: Observable<number[]>;
  } = {
    user: new ReplaySubject<User>(1),
    playersStates: new ReplaySubject<PlayerState>(1),
  };

  private user: User;
  private gameId: string;
  private refCommands: Reference;
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

  on(
    path: string,
    type: EventType = 'value',
    query?: (ref: Reference) => Query
  ) {
    return new Observable((subscriber: Subscriber<any>) => {
      const onValue = (snapshot: DataSnapshot) => {
        subscriber.next(snapshot.val());
      };
      const onError = (error: Error) => {
        subscriber.error(error);
      };
      let ref: Reference | Query = this.ref(path);
      if (query) {
        ref = query(ref as Reference);
      }
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

  gameReady(maxTime?: number) {
    let stream: Observable<PlayerState> = this.changes.playersStates;
    if (maxTime) {
      stream = stream.pipe(timeout(maxTime));
    }

    return stream.pipe(
      filter((state) => !!state?.gameId),
      debounceTime(0),
      switchMap(() => this.changes.game),
      takeUntil(this.destroyed$)
    );
  }

  private listen<T = any>(
    path: string,
    type: EventType = 'value',
    query?: (ref: Reference) => Query
  ) {
    const observable = new Observable((subscriber: Subscriber<T>) => {
      const subscription = this.on(path, type, query).subscribe(subscriber);
      return () => subscription.unsubscribe();
    });
    return observable.pipe(
      takeUntil(this.destroyed$),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }

  private onLogin(user: User) {
    console.log('onLogin', { user });

    this.listen('/players_states/{uid}').subscribe(this.onPlayerStateChanges);

    this.refCommands = this.ref('/commands/{uid}');

    this.setPlayerData({
      displayName: user.displayName || null,
      photoURL: user.photoURL || null,
    });
  }

  private onPlayerStateChanges = (state: any) => {
    console.log('onPlayerStateChanges', state);
    this.changes.playersStates.next(state);

    if (state?.gameId && state.gameId !== this.gameId) {
      this.gameId = state.gameId;

      this.changes.game = this.listen('/games/{gameId}');
      this.changes.board = this.listen('/games/{gameId}/board');
      this.changes.turn = this.listen('/games/{gameId}/turnId');
      this.changes.winner = this.listen('/games/{gameId}/winnerId');
      this.changes.pool = this.listen('/games/{gameId}/pool');

      this.changes.updates = this.listen(
        '/games/{gameId}/updates',
        'child_added',
        (ref: Reference) => {
          return ref.orderByChild('timestamp').startAt(Date.now());
        }
      );

      // this.ref('/games/{gameId}/updates')
      //   .orderByChild('timestamp')
      //   .startAt(Date.now())
      //   .on('child_added', (snapshot) => {
      //     this.changes.updates.next(snapshot.val());
      //   });
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
