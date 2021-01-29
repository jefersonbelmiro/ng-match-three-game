import {
  ChangeDetectorRef,
  Component,
  NgZone,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { Router } from '@angular/router';
import { Position } from '@shared/board';
import { find } from '@shared/find';
import {
  Game,
  Player,
  playerDamage,
  processMatchesFactory,
  Update,
} from '@shared/server';
import {
  EMPTY,
  forkJoin,
  from,
  merge,
  Observable,
  of,
  ReplaySubject,
  throwError,
} from 'rxjs';
import {
  catchError,
  concatMap,
  debounceTime,
  filter,
  finalize,
  switchMap,
  take,
  takeUntil,
  tap,
} from 'rxjs/operators';
import { EffectScoreComponent } from '../../components/effect-score/effect-score.component';
import { BoardService } from '../../services/board.service';
import { ServerService } from '../../services/server.service';
import { SpriteService } from '../../services/sprite.service';
import { StateService } from '../../services/state.service';
import { TileService } from '../../services/tile.service';
import { Board } from '../../shared';
import { User } from '../../shared/firebase';

@Component({
  selector: 'app-multiplayer',
  templateUrl: './multiplayer.component.html',
  styleUrls: ['./multiplayer.component.scss'],
})
export class MultiplayerComponent implements OnInit, OnDestroy {
  @ViewChild('container', { read: ViewContainerRef, static: true })
  container: ViewContainerRef;

  user: User;
  boardData: Board;
  game: Game;
  player: Player;
  opponent: Player;
  turnId: string;
  loading: boolean;

  winnerText: string;
  poolType: number[];

  destroyed$ = new ReplaySubject(1);

  constructor(
    private tileBuilder: TileService,
    private board: BoardService,
    private sprite: SpriteService,
    private state: StateService,
    private router: Router,
    private server: ServerService,
    private cd: ChangeDetectorRef,
    private ngZone: NgZone
  ) {
    let size = 350;
    this.boardData = {
      rows: 5,
      columns: 5,
      width: size,
      height: size,
    };

    const turnQuery = () => {
      if (!this.turnId || !this.player?.id) {
        return false;
      }
      return this.turnId !== this.player.id;
    };
    this.state.setBusyQuery([turnQuery]);
  }

  ngOnInit(): void {
    this.sprite.setContainer(this.container);

    forkJoin([this.loadUser(), this.loadGame()])
      .pipe(
        switchMap(() => {
          return merge(
            this.loadBoard(),
            this.loadTurn(),
            this.loadUpdates(),
            this.loadTypesPool(),
            this.loadWinner()
          );
        }),
        takeUntil(this.destroyed$)
      )
      .subscribe({
        error: (error) => console.error('ngOnInit', error),
      });
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
    this.sprite.pool.clear();
    this.state.setBusyQuery([]);
  }

  createBoard(data: number[][]) {
    const createTile = this.tileBuilder.createFactory();
    const destroyTile = this.tileBuilder.destroyFactory();
    const updateTile = this.tileBuilder.updateFactory();
    this.board.createFromServer(this.boardData, data, {
      createTile,
      destroyTile,
      updateTile,
    });
  }

  onSwap({ source, target }) {
    if (this.turnId !== this.player.id) {
      return;
    }
    const payload = {
      command: 'shift',
      gameId: this.game.id,
      source: { row: source.row, column: source.column },
      target: { row: target.row, column: target.column },
    };
    this.server.pushCommand(payload);
    this.turnId = this.opponent.id;
    this.doSwap(source, target).subscribe(() => {
      this.processMatches().subscribe();
    });
  }

  doSwap(source: Position, target: Position) {
    this.state.setBusy(true);
    const sourceTile = this.board.getAt(source);
    const targetTile = this.board.getAt(target);
    const options = { fallingAnimatin: false };
    const shifts = [
      sourceTile.shift(target, options),
      targetTile.shift(source, options),
    ];
    return forkJoin(shifts).pipe(
      finalize(() => {
        this.state.setBusy(false);
      })
    );
  }

  private loadUser() {
    return this.server.changes.user.pipe(
      take(1),
      tap((user) => {
        this.user = user;
      })
    );
  }

  private loadGame() {
    this.loading = true;
    this.board.data = [];
    return this.server.gameReady(2000).pipe(
      take(1),
      finalize(() => {
        this.loading = false;
      }),
      tap((game) => {
        this.game = game;
        if (!game) {
          return;
        }
        this.player = game.players.find(
          (player) => player.id === this.user.uid
        );
        this.opponent = game.players.find(
          (player) => player.id !== this.user.uid
        );
        if (!this.board.data?.length) {
          this.createBoard(game.board);
          this.cd.detectChanges();
        }
      }),
      catchError((error) => {
        if (error?.name === 'TimeoutError') {
          this.ngZone.run(() => this.router.navigate(['/']));
        }
        return throwError(error);
      })
    );
  }

  private loadBoard() {
    return this.server.changes.board.pipe(
      tap((data) => {
        this.board.serverData = data;
      }),
      this.waitBusy(),
      tap(() => this.board.sync())
    );
  }

  private loadTurn() {
    return this.server.changes.turn.pipe(
      tap((turnId) => {
        this.turnId = turnId;
        this.cd.detectChanges();
      })
    );
  }

  private loadWinner(): Observable<string> {
    return this.server.changes.winner.pipe(
      this.waitBusy(),
      filter((id) => !!id),
      tap((id) => {
        const win = this.player?.id === id;
        this.winnerText = win ? 'You win' : 'You lose';
        this.cd.detectChanges();
        this.server.pushCommand({ command: 'gameEnd' });
      })
    );
  }

  private loadTypesPool() {
    return this.server.changes.pool.pipe(
      take(1),
      tap((pool) => {
        this.poolType = pool;
      }),
      switchMap(() => {
        return this.server.changes.poolAdded;
      }),
      tap((type) => {
        this.poolType.push(type);
      })
    );
  }

  private loadUpdates() {
    return this.server.changes.updates.pipe(
      filter((update) => {
        return update && update.ownerId !== this.player.id;
      }),
      this.updateMap({ isPlayer: false }),
      takeUntil(this.destroyed$)
    );
  }

  private onUpdateShift(update: Update) {
    const stream = this.doSwap(update.source, update.target);
    return this.busyDefer(stream);
  }

  private onUpdateDie(update: Update, options: { isPlayer: boolean }) {
    const dies = update.data
      .map((update) => {
        return this.board.getAt(update.target);
      })
      .filter((item) => !!item)
      .map((tile) => tile.die());

    const scoreValue = playerDamage(dies.length);
    this.createScoreEffect(
      update.data[0].target,
      scoreValue,
      options.isPlayer
    ).subscribe(() => {
      let current = options.isPlayer ? this.opponent : this.player;
      let life = current.life - scoreValue;
      if (life < 0) {
        life = 0;
      }
      if (options.isPlayer) {
        this.opponent = { ...current, life };
      } else {
        this.player = { ...current, life };
      }
    });

    return this.busyDefer(forkJoin(dies));
  }

  private onUpdateFill(update: Update) {
    const fill = update.data.map((update) => {
      if (update.type === 'shift') {
        const tile = this.board.getAt(update.source);
        if (!tile) {
          console.error('tile not found', update.source);
          return of(null);
        }
        return tile.shift(update.target);
      }
      if (update.type === 'new') {
        const tile = this.board.createAt(update.source, update.source.type);
        return tile.shift(update.target);
      }
      return of(null);
    });
    return this.busyDefer(forkJoin(fill));
  }

  private processMatches() {
    const board = this.board.getData();
    const matches = find(board);
    if (!matches.length) {
      return EMPTY;
    }

    const processMatches = processMatchesFactory(board, this.poolType);
    const { updates } = processMatches(matches);

    return from(updates).pipe(this.updateMap({ isPlayer: true }));
  }

  private updateMap(options: { isPlayer: boolean }) {
    return concatMap((update: Update) => {
      if (update.type === 'shift') {
        return this.onUpdateShift(update);
      }
      if (update.type === 'die') {
        return this.onUpdateDie(update, options);
      }
      if (update.type === 'fill') {
        return this.onUpdateFill(update);
      }
      return EMPTY;
    });
  }

  private createScoreEffect({ row, column }, value: number, isPlayer: boolean) {
    const ref = this.sprite.create(EffectScoreComponent);
    const width = this.boardData.width / this.boardData.columns;
    const height = this.boardData.height / this.boardData.rows;
    const score = ref.instance;
    score.value = value;
    score.x = width * column + width / 2 - 15;
    score.y = height * row + height / 2 - 15;

    let target = { x: 290, y: -70 };
    if (!isPlayer) {
      target = { x: 10, y: -70 };
    }

    return score.die(target).pipe(
      finalize(() => {
        this.sprite.destroy(score);
      })
    );
  }

  private waitBusy<T = any>() {
    return switchMap((response: T) => {
      if (!this.state.isBusy()) {
        return of(response);
      }
      return this.state.getState().pipe(
        debounceTime(100),
        filter(() => !this.state.isBusy()),
        switchMap(() => of(response))
      );
    });
  }

  private busyDefer<T = any>(stream: Observable<T>) {
    this.state.setBusy(true);
    return stream.pipe(finalize(() => this.state.setBusy(false)));
  }
}
