import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { DatabaseReference } from '@angular/fire/database/interfaces';
import { finalize, takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ReplaySubject } from 'rxjs';
import { ServerService } from '../../services/server.service';
import { Game, Player, PlayerState } from '@shared/server';
import { User } from '../../shared/firebase';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.scss'],
})
export class LobbyComponent implements OnInit {
  user: User;
  playerState: PlayerState;
  game: Game;

  player: Player;
  opponent: Player;

  loading = false;

  refGameState: DatabaseReference;
  refPlayerState: DatabaseReference;
  refCommands: DatabaseReference;

  destroyed$ = new ReplaySubject(1);

  constructor(
    private cd: ChangeDetectorRef,
    private router: Router,
    private ngZone: NgZone,
    private server: ServerService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.server.changes.user
      .pipe(takeUntil(this.destroyed$))
      .subscribe((user) => {
        this.user = user;
        this.loading = false;
        this.cd.detectChanges();
        console.log('subscribe user observable', user?.uid, { user });
      });

    this.server.changes.playersStates
      .pipe(takeUntil(this.destroyed$))
      .subscribe((state) => {
        console.log('playersStates changes', state);
        this.playerState = state;
        this.cd.detectChanges();
      });

    this.server.gameReady().subscribe((game) => {
      console.log('game changes', game);
      this.game = game;
      if (!game) {
        return;
      }
      this.player = game.players.find((player) => player.id === this.user.uid);
      this.opponent = game.players.find(
        (player) => player.id !== this.user.uid
      );

      const playersReady = game.players.every((player) => player.ready);
      if (playersReady) {
        this.ngZone.run(() => this.router.navigate(['/multiplayer']));
      }

      this.cd.detectChanges();
      console.log('game players', {
        player: this.player,
        opponent: this.opponent,
      });
    });
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
    if (this.playerState?.matching) {
      this.server.removeCommands();
    }
  }

  onLoginWithGoogle() {
    this.loading = true;
    this.server
      .loginWithGoogle()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe();
  }

  onLoginAnonymous() {
    this.loading = true;
    this.server
      .loginAnonymously()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe();
  }

  onFindOpponent() {
    console.log('find opponent');
    if (!this.playerState) {
      this.playerState = {};
    }
    this.playerState.matching = true;
    this.server.pushCommand({ command: 'match' });
  }

  onReady() {
    this.server.setReady();
  }

  onCancel() {
    console.log('cancel');
    this.playerState.match = false;
    this.cd.detectChanges();
    this.server.removeCommands();
  }

  onLogout() {
    console.log('logout');
    this.server.removeCommands();
    this.server.signOut().subscribe(() => {
      this.user = null;
    });
  }
}
