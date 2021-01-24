import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { Router } from '@angular/router';
import { EMPTY, forkJoin, merge, throwError } from 'rxjs';
import { catchError, concatMap, filter, switchMap, take, tap } from 'rxjs/operators';
import { BoardService } from '../../services/board.service';
import { ServerService } from '../../services/server.service';
import { SpriteService } from '../../services/sprite.service';
import { StateService } from '../../services/state.service';
import { TileService } from '../../services/tile.service';
import { Board, Tile } from '../../shared';
import { User } from '../../shared/firebase';
import { Game, Player, Position, Update } from '@shared/server';

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

  constructor(
    private tileBuilder: TileService,
    private board: BoardService,
    private sprite: SpriteService,
    private state: StateService,
    private router: Router,
    private server: ServerService,
    private cd: ChangeDetectorRef
  ) {
    let size = 350;
    this.boardData = {
      rows: 5, // @TODO - get from data.length
      columns: 5, // @TODO - get from data[0].length
      width: size,
      height: size,
    };
  }

  ngOnInit(): void {
    this.sprite.setContainer(this.container);

    forkJoin([this.loadUser(), this.loadGame(), this.loadBoard()])
      .pipe(
        switchMap(() => {
          return merge(this.loadTurn(), this.loadUpdates());
        })
      )
      .subscribe({
        error: (error) => console.log('error', error),
      });
  }

  ngOnDestroy() {}

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
    this.state.setBusy(true, true);
    this.turnId = this.opponent.id;
    this.doSwap(source, target).subscribe();
    console.log('onSwap', { source, target, payload });
  }

  doSwap(source: Tile, target: Tile) {
    console.log('doSwap', { source, target });
    const sourceTile = this.board.getAt(source);
    const targetTile = this.board.getAt(target);
    const options = { fallingAnimatin: false };
    const shifts = [
      sourceTile.shift(target, options),
      targetTile.shift(source, options),
    ];
    return forkJoin(shifts);
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
          this.router.navigate(['/']);
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
      tap((turnId) => {
        this.turnId = turnId;
        const playerTurn = this.player?.id === turnId;
        console.log('turn', turnId, playerTurn);
        this.state.setBusy(!playerTurn, true);
        this.cd.detectChanges();
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
      })
    );
  }

  private onUpdateShift(update: Update) {
    return this.doSwap(update.source as Tile, update.target as Tile);
  }

  private onUpdateDie(update: Update) {
    const dies = (update.target as Position[])
      .map((position) => {
        return this.board.getAt(position);
      })
      .filter((item) => !!item)
      .map((tile) => tile.die());
    return forkJoin(dies);
  }

  private onUpdateFill(update: Update) {
    const fill = (update.target as Position[])
      .map((position) => {
        return this.board.getAt(position);
      })
      .filter((item) => !!item)
      .map((tile) => tile.die());
    return forkJoin(fill);
  }
}
