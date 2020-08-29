import {
  Component,
  Input,
  OnChanges,
  OnInit,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { EMPTY, forkJoin, Observable } from 'rxjs';
import { finalize, switchMap } from 'rxjs/operators';
import { BoardService } from '../../services/board.service';
import { MatchService } from '../../services/match.service';
import { StateService } from '../../services/state.service';
import { TileService } from '../../services/tile.service';
import { Board, Position, Tile } from '../../shared';

@Component({
  selector: 'app-play',
  templateUrl: './play.component.html',
  styleUrls: ['./play.component.scss'],
})
export class PlayComponent implements OnInit, OnChanges {
  @Input() width: number;
  @Input() height: number;

  @Input() rows: number = 5;
  @Input() columns: number = 5;

  boardConfig: Board;

  @ViewChild('container', { read: ViewContainerRef, static: true })
  container: ViewContainerRef;

  constructor(
    private tileBuilder: TileService,
    private board: BoardService,
    private matches: MatchService,
    private state: StateService
  ) {}

  ngOnInit() {}

  ngOnChanges() {
    if (!this.boardConfig) {
      return this.createBoard();
    }
    this.updateBoard();
  }

  createBoard() {
    let size = Math.min(this.width, this.height, 400);
    this.boardConfig = {
      rows: this.rows,
      columns: this.columns,
      width: size,
      height: size,
    };
    const createFactory = this.tileBuilder.buildCreateFactory(this.container);
    this.board.create(this.boardConfig, createFactory);
  }

  updateBoard() {
    let size = Math.min(this.width, this.height, 400);
    this.boardConfig = { ...this.board, width: size, height: size };
    this.board.update(this.boardConfig);
  }

  onSwap({ source, target }) {
    this.doSwap(source, target).subscribe(() => {
      const matches = [
        ...this.matches.find(source),
        ...this.matches.find(target),
      ];
      if (!matches.length) {
        return this.doSwap(source, target).subscribe();
      }
      this.processMatches(matches);
    });
  }

  doSwap(source: Tile, target: Tile) {
    const sourceTile = this.board.getAt(source);
    const targetTile = this.board.getAt(target);
    const shifts = [sourceTile.shift(target), targetTile.shift(source)];
    this.state.setBusy(true);
    return forkJoin(shifts).pipe(
      finalize(() => {
        this.state.setBusy(false);
      })
    );
  }

  processMatches(matches: Tile[]) {
    this.state.setBusy(true);
    const deaths = matches.map((tile) => tile.die());
    forkJoin(deaths.length ? deaths : EMPTY)
      .pipe(
        switchMap(() => this.fillBoard()),
        finalize(() => this.state.setBusy(false))
      )
      .subscribe(() => {
        this.processMatches(this.matches.find());
      });
  }

  fillBoard() {
    const data$: Observable<void>[] = [];
    for (let column = 0; column < this.columns; column++) {
      let shift = 0;
      const shiftData = [];
      for (let row = this.rows - 1; row >= 0; row--) {
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
        const tile = this.board.crateAt({ row: row - shift, column });
        const stream$ = tile.shift({ row, column });
        data$.push(stream$);
      });
    }

    return data$.length ? forkJoin(data$) : EMPTY;
  }
}
