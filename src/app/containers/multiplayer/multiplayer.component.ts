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
import {
  EMPTY,
  forkJoin,
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
import { BoardService } from '../../services/board.service';
import { ServerService } from '../../services/server.service';
import { SpriteService } from '../../services/sprite.service';
import { StateService } from '../../services/state.service';
import { TileService } from '../../services/tile.service';
import { Board, Tile } from '../../shared';
import { User } from '../../shared/firebase';
import { Game, Player, playerDamage, Update } from '@shared/server';
import { Position } from '@shared/board';
import { MatchService } from '../../services/match.service';
import { EffectScoreComponent } from '../../components/effect-score/effect-score.component';

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

  destroyed$ = new ReplaySubject(1);

  constructor(
    private tileBuilder: TileService,
    private board: BoardService,
    private sprite: SpriteService,
    private state: StateService,
    private router: Router,
    private server: ServerService,
    private cd: ChangeDetectorRef,
    private ngZone: NgZone,
    private matches: MatchService
  ) {
    let size = 350;
    this.boardData = {
      rows: 5, // @TODO - get from data.length
      columns: 5, // @TODO - get from data[0].length
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

    forkJoin([this.loadUser(), this.loadGame(), this.loadBoard()])
      .pipe(
        switchMap(() => {
          return merge(
            this.loadTurn(),
            this.loadUpdates(),
            this.loadTypesPool(),
            this.loadWinner()
          );
        }),
        takeUntil(this.destroyed$)
      )
      .subscribe({
        error: (error) => console.log('error', error),
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
    this.board.createFromServer(this.boardData, data, {
      createTile,
      destroyTile,
    });
  }

  onSelect(tile: Tile) {
    console.log('onSelect', { tile });
  }

  onSwap({ source, target }) {
    if (this.turnId !== this.player.id) {
      console.log('doSwap opponent turn');
      return;
    }
    const payload = {
      command: 'shift',
      gameId: this.game.id,
      source: { row: source.row, column: source.column },
      target: { row: target.row, column: target.column },
    };
    this.server.pushCommand(payload);
    // this.state.setBusy(true, true);
    this.turnId = this.opponent.id;
    console.log('onSwap', { source, target, payload });
    this.doSwap(source, target).subscribe(() => {
      const matches = this.matches.find();
      this.processMatches(matches);
    });
  }

  doSwap(source: Position, target: Position) {
    console.log('doSwap', { source, target });
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
    return this.server.gameReady(2000).pipe(
      take(1),
      tap((game) => {
        console.log('game', { game });
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
      }),
      catchError((error) => {
        console.log('catchError', error);
        if (error?.name === 'TimeoutError') {
          this.ngZone.run(() => this.router.navigate(['/']));
        }
        return throwError(error);
      })
    );
  }

  private loadBoard() {
    return this.server.gameReady().pipe(
      switchMap(() => this.server.changes.board),
      filter((data) => !!data?.length),
      take(1),
      tap((data) => {
        console.log('board', { data });
        this.createBoard(data);
      })
    );
  }

  private loadTurn() {
    return this.server.changes.turn.pipe(
      // this.waitBusy(),
      tap((turnId) => {
        this.turnId = turnId;
        const playerTurn = this.player?.id === turnId;
        console.log('turn', turnId, playerTurn);
        // this.state.setBusy(!playerTurn);
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
        let text = win ? 'You win' : 'You lose';
        this.server.removeCommands().subscribe(() => {
          this.ngZone.run(() => this.router.navigate(['/lobby']));
        });
        alert(text);
      })
    );
  }

  private loadTypesPool(): Observable<number[]> {
    return this.server.changes.pool.pipe(
      this.waitBusy(),
      tap((pool) => {
        this.board.types = pool;
      })
    );
  }

  private loadUpdates() {
    return this.server.changes.updates.pipe(
      filter((update) => {
        return update && update.ownerId !== this.player.id;
      }),
      concatMap((update) => {
        console.log('on update', { update });
        if (update.type === 'shift') {
          return this.onUpdateShift(update);
        }
        if (update.type === 'die') {
          return this.onUpdateDie(update);
        }
        if (update.type === 'fill') {
          return this.onUpdateFill(update);
        }
        return EMPTY;
      }),
      takeUntil(this.destroyed$),
    );
  }

  private onUpdateShift(update: Update) {
    const stream = this.doSwap(update.source, update.target);
    return this.busyDefer(stream);
  }

  private onUpdateDie(update: Update) {
    const dies = update.data
      .map((update) => {
        return this.board.getAt(update.target);
      })
      .filter((item) => !!item)
      .map((tile) => tile.die());

    const scoreValue = playerDamage(dies.length);
    this.createScoreEffect(update.data[0].target, scoreValue, false).subscribe(
      () => {
        this.player = { ...this.player, life: this.player.life - scoreValue };
      }
    );

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

  private processMatches(matches: Tile[]) {
    if (matches.length === 0) {
      return;
    }
    this.state.setBusy(true);
    const deaths = this.updateLevel(matches);
    forkJoin(deaths)
      .pipe(
        switchMap(() => this.fillBoard()),
        finalize(() => this.state.setBusy(false))
      )
      .subscribe(() => {
        this.processMatches(this.matches.find());
      });
  }

  private updateLevel(matches: Tile[]) {
    const deaths = [];
    matches
      .filter((item, index, array) => {
        return array.indexOf(item) === index;
      })
      .forEach((current: Tile) => {
        deaths.push(current.die());
      });

    const scoreValue = playerDamage(matches.length);
    this.createScoreEffect(matches[0], scoreValue, true).subscribe(() => {
      this.opponent = {
        ...this.opponent,
        life: this.opponent.life - scoreValue,
      };
    });

    return deaths;
  }

  private fillBoard() {
    const data$: Observable<void>[] = [];
    for (let column = 0; column < this.boardData.columns; column++) {
      let shift = 0;
      const shiftData = [];
      for (let row = this.boardData.rows - 1; row >= 0; row--) {
        const tile = this.board.getAt({ row, column } as Position);
        if (!tile || !tile.alive) {
          shiftData.push({ row: shift, column });
          shift++;
          continue;
        }
        if (shift > 0) {
          const shift$ = tile.shift({ row: row + shift, column });
          data$.push(shift$);
        }
      }
      shiftData.forEach(({ row, column }) => {
        const tile = this.board.createAt(
          { row: row - shift, column },
          this.board.types.shift()
        );
        const stream$ = tile.shift({ row, column });
        data$.push(stream$);
      });
    }

    return data$.length ? forkJoin(data$) : EMPTY;
  }

  private createScoreEffect({ row, column }, value: number, player: boolean) {
    const ref = this.sprite.create(EffectScoreComponent);
    const width = this.boardData.width / this.boardData.columns;
    const height = this.boardData.height / this.boardData.rows;
    const score = ref.instance;
    score.value = value;
    score.x = width * column + width / 2 - 15;
    score.y = height * row + height / 2 - 15;

    let target = { x: 290, y: -70 };
    if (!player) {
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
