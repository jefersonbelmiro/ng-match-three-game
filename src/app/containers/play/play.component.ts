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
import { Board, Position, Tile, Colors } from '../../shared';
import { LevelService } from '../../services/level.service';

const DEFAULT_SIZE = 600;

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
  // @FIXME - add interface
  levelData;

  @ViewChild('container', { read: ViewContainerRef, static: true })
  container: ViewContainerRef;

  constructor(
    private tileBuilder: TileService,
    private board: BoardService,
    private matches: MatchService,
    private state: StateService,
    private level: LevelService
  ) {}

  ngOnInit() {
    this.createBoard();
    this.level.create(this.board.data);
    this.level.getState().subscribe((data) => (this.levelData = data));
  }

  ngOnChanges() {
    if (this.boardConfig) {
      this.updateBoard();
    }
  }

  createBoard() {
    let size = Math.min(this.width, this.height, DEFAULT_SIZE);
    this.boardConfig = {
      rows: this.rows,
      columns: this.columns,
      width: size,
      height: size,
    };
    const createTileFactory = this.tileBuilder.buildCreateFactory(
      this.container
    );
    const updateTileFactory = this.tileBuilder.buildUpdateFactory();
    this.board.create(this.boardConfig, {
      createTileFactory,
      updateTileFactory,
    });
  }

  updateBoard() {
    let size = Math.min(this.width, this.height, DEFAULT_SIZE);
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

      this.level.updateMoves();
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

    this.updateLevel(matches);

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

  updateLevel(matches: Tile[]) {
    const types = matches
      .filter((item, index, array) => {
        return array.indexOf(item) === index;
      })
      .reduce((data, current: Tile) => {
        console.log('data', current.type, current.row, current.column);
        if (!data[current.type]) {
          data[current.type] = 0;
        }
        data[current.type] += 1;
        return data;
      }, {});

    Object.keys(types).forEach((type) => {
      console.log('matchs', type, types[type]);
      if (this.level.isTargetType(type as Colors)) {
        this.level.updateTarget(type as Colors, types[type]);
      }
      this.level.updateScore();
    });

    console.log('matchs types', types);
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
