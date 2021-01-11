import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { DatabaseReference } from '@angular/fire/database/interfaces';
import { finalize, take, takeUntil } from 'rxjs/operators';
// import * as firebase from 'firebase';
// import * as firebase from 'firebase/app';
// import 'firebase/functions';
import { AuthService } from '../../services/auth.service';
import firebase from 'firebase/app';
import { StateService } from '../../services/state.service';
import { MultiplayerData } from '../../shared';
import { Router } from '@angular/router';
import { ReplaySubject } from 'rxjs';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.scss'],
})
export class LobbyComponent implements OnInit {
  userData: firebase.User;
  loading = false;
  match = false;
  matching = false;
  ready = false;

  multiplayerData: MultiplayerData;

  refGameState: DatabaseReference;
  refPlayerState: DatabaseReference;
  refCommands: DatabaseReference;

  destroyed$ = new ReplaySubject(1);
  constructor(
    private firebase: AngularFireDatabase,
    private auth: AuthService,
    private cd: ChangeDetectorRef,
    private state: StateService,
    private router: Router,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    console.log('init', { userData: this.auth.userData });

    this.loading = true;
    this.auth.userDataObservable
      .pipe(
        take(1),
        finalize(() => (this.loading = false))
      )
      .subscribe((user) => {
        console.log('subscribe userData observable', { user });
        this.userData = user;
        if (user) {
          this.onLogin(user);
        }
      });

    this.state
      .getState()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(({ multiplayer }) => {
        this.multiplayerData = multiplayer;
        this.cd.detectChanges();
        if (multiplayer?.player?.ready && multiplayer?.opponent?.ready) {
          this.ngZone.run(() => this.router.navigate(['/multiplayer']));
        }
      });
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
    if (this.matching) {
      this.removeCommands();
    }
    this.removeListeners();
  }

  onLoginWithGoogle() {
    this.auth.loginWithGoogle().subscribe((user) => this.onLogin(user));
  }

  onLoginAnonymous() {
    this.loading = true;
    this.auth
      .loginAnonymously()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe((user) => this.onLogin(user));
  }

  onLogin(user: firebase.User) {
    console.log('onLogin', { user });
    const uid = user.uid;

    this.userData = user;
    this.refPlayerState = this.firebase.database.ref(`/players_states/${uid}`);
    this.refCommands = this.firebase.database.ref(`/commands/${uid}`);

    this.refPlayerState.on('value', this.onPlayerStateChanges);

    this.firebase.database.ref(`/players/${uid}`).update({
      displayName: user.displayName || null,
      photoUrl: user.photoURL || null,
    });
  }

  async onFindOpponent() {
    console.log('find opponent');
    this.matching = true;
    await this.refCommands.push({ command: 'match' });
  }

  onReady() {
    this.ready = true;
    const uid = this.userData.uid;
    const gameId = this.multiplayerData.gameId;
    this.refCommands.push({ command: 'ready', gameId });
    console.log('ready', { uid, gameId });
  }

  onCancel() {
    console.log('cancel');
    this.match = false;
    this.matching = false;
    this.ready = false;
    this.cd.detectChanges();
    this.removeCommands();
  }

  onLogout() {
    console.log('logout');
    this.removeCommands();
    this.removeListeners();
    this.auth.signOut().subscribe(() => {
      this.userData = null;
    });
  }

  onPlayerStateChanges = (snapshot: firebase.database.DataSnapshot) => {
    const state = snapshot.val();
    console.log('onPlayerStateChanges', state);
    if (!state) {
      return;
    }

    this.matching = state?.matching;
    if (state?.gameId) {
      this.match = true;
      this.refGameState = this.firebase.database.ref(`/games/${state.gameId}`);
      this.refGameState.on('value', this.onGameStateChanges);
    }

    this.cd.detectChanges();
  };

  onGameStateChanges = (snapshot: firebase.database.DataSnapshot) => {
    const state = snapshot.val();
    console.log('onGameStateChanges', state, {
      matching: this.matching,
      match: this.match,
    });
    // remove removed
    if (!state) {
      // when match is because other play leave lobby, continue to find
      this.matching = this.match;
      this.match = false;
      this.cd.detectChanges();
      return;
    }

    const player = state.players.find(
      (item: { uid: string }) => item.uid === this.userData.uid
    );
    const opponent = state.players.find(
      (item: { uid: string }) => item.uid !== this.userData.uid
    );
    const data: MultiplayerData = {
      gameId: state.gameId,
      opponent,
      player,
    };
    this.state.set({ multiplayer: data });
  };

  private removeListeners() {
    if (this.refPlayerState) {
      this.refPlayerState.off('value', this.onPlayerStateChanges);
      this.refPlayerState = undefined;
    }

    if (this.refGameState) {
      this.refGameState.off('value', this.onGameStateChanges);
      this.refGameState = undefined;
    }
  }

  private async removeCommands() {
    const uid = this.userData?.uid;
    if (uid) {
      await this.firebase.database.ref(`/commands/${uid}`).remove();
    }
  }
}
