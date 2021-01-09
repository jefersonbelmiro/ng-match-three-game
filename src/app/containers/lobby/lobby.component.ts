import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { DatabaseReference } from '@angular/fire/database/interfaces';
import { finalize, take } from 'rxjs/operators';
// import * as firebase from 'firebase';
// import * as firebase from 'firebase/app';
// import 'firebase/functions';
import { AuthService } from '../../services/auth.service';
import firebase from 'firebase/app';

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

  refGameState: DatabaseReference;
  refPlayerState: DatabaseReference;
  refCommands: DatabaseReference;

  constructor(
    private firebase: AngularFireDatabase,
    private auth: AuthService,
    private cd: ChangeDetectorRef
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
  }

  ngOnDestroy() {
    this.removeCommands();
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
      displayName: user.displayName || 'player',
      photoUrl: user.photoURL || null,
    });
  }

  async onFindOpponent() {
    console.log('find opponent');
    // empty object to be truthy in template
    this.matching = true;
    await this.refCommands.push('match');
  }

  onReady() {
    console.log('ready');
  }

  onCancel() {
    console.log('cancel');
    this.match = false;
    this.matching = false;
    this.removeCommands();
  }

  onLogout() {
    console.log('logout');
    this.removeCommands();
    this.removeListeners();
    this.auth.signOut();
  }

  onPlayerStateChanges = (snapshot: firebase.database.DataSnapshot) => {
    const state = snapshot.val();
    console.log('onPlayerStateChanges', state);
    this.matching = state?.matching;
    if (!state) {
      return;
    }

    if (state?.gameId) {
      this.match = true;
      this.refGameState = this.firebase.database.ref(`/games/${state.gameId}`);
      this.refGameState.on("value", this.onGameStateChanges);
    }

    this.cd.detectChanges();
  };

  onGameStateChanges = (snapshot: firebase.database.DataSnapshot) => {
    const state = snapshot.val();
    // remove removed
    if (!state) {
      // when match is because other play leave lobby, continue to find
      this.matching = this.match;
      this.match = false;
      this.cd.detectChanges();
    }
    console.log('onGameStateChanges', state);
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
    const uid = this.userData.uid;
    if (uid) {
      await this.firebase.database.ref(`/commands/${uid}`).remove();
    }
  }
}
