import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { DatabaseReference } from '@angular/fire/database/interfaces';
import { finalize, takeUntil, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Observable, ReplaySubject } from 'rxjs';
import { ServerService } from '../../services/server.service';
import { Game, Player, PlayerState } from '@shared/server';
import { Reference, User } from '../../shared/firebase';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.scss'],
})
export class LobbyComponent implements OnInit {
  user: User;
  playerState: PlayerState = {};
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
        this.playerState = state || {};
        this.cd.detectChanges();
      });

    this.server
      .gameReady()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((game) => {
        console.log('game changes', game);
        this.game = game;
        if (!game || game.winnerId) {
          return;
        }
        this.player = game.players.find(
          (player) => player.id === this.user.uid
        );
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
      this.server.pushCommand({ command: 'cancelMatch' });
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
    this.playerState.matching = true;
    this.loading = true;
    this.cd.detectChanges();

    const stream = this.server.pushCommand(
      { command: 'match' },
      { execute: false }
    );
    (stream as Observable<Reference>)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe();
  }

  onReady() {
    this.server.setReady();
  }

  onCancel() {
    console.log('cancel');
    this.playerState.match = false;
    this.cd.detectChanges();
    this.server.pushCommand({ command: 'cancelMatch' });
  }

  onLogout() {
    console.log('logout');
    this.server.pushCommand({ command: 'exit' });
    this.server.signOut().subscribe(() => {
      this.user = null;
    });
  }
}
