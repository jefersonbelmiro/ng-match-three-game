import {
  Component,
  Input,
  OnChanges,
  OnInit,
  ViewChild,
  ViewContainerRef,
  HostListener,
  HostBinding,
} from '@angular/core';
import { EMPTY, forkJoin, Observable } from 'rxjs';
import { finalize, switchMap, tap } from 'rxjs/operators';
import { BoardService } from '../../services/board.service';
import { MatchService } from '../../services/match.service';
import { StateService } from '../../services/state.service';
import { TileService } from '../../services/tile.service';
import { Board, Position, Tile, Colors } from '../../shared';
import { LevelService } from '../../services/level.service';
import { EffectScoreComponent } from '../../components/effect-score/effect-score.component';
import { SpriteService } from '../../services/sprite.service';
import { trigger, group } from '@angular/animations';
import { transition } from '@angular/animations';
import { query } from '@angular/animations';
import { style } from '@angular/animations';
import { animate } from '@angular/animations';
import { keyframes } from '@angular/animations';

const BOARD_SIZE = 350;

@Component({
  selector: 'app-play',
  templateUrl: './play.component.html',
  styleUrls: ['./play.component.scss'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        group([

          query('app-level-status', [
            style({ transform: 'scale(0)' }),
            animate(
              '300ms 150ms',
              keyframes([
                style({ transform: 'translateY(-50%)', opacity: 0, }),
                style({ transform: 'translateY(0)', opacity: 1 }),
              ])
            ),
          ]),

          query('app-board', [
            style({ transform: 'scale(0)', }),
            animate(
              '400ms 350ms',
              keyframes([
                style({ transform: 'scale(0.5)', opacity: 0, }),
                style({ transform: 'scale(1)', opacity: 1 }),
              ])
            ),
          ]),

          query('app-power-ups', [
            style({ transform: 'scale(0)' }),
            animate(
              '300ms 350ms',
              keyframes([
                style({ transform: 'translateY(50%)', opacity: 0, }),
                style({ transform: 'translateY(0)', opacity: 1 }),
              ])
            ),
          ]),
        ]),
      ]),
    ]),
  ],
})
export class PlayComponent implements OnInit, OnChanges {
  @HostBinding('@fadeIn') fadeIn: string;
  width = 400;
  height = 400;

  rows = 5;
  columns = 5;

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
    private level: LevelService,
    private sprite: SpriteService
  ) {
    this.updateSize();
  }

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

  @HostListener('window:resize')
  onResize() {
    this.updateSize();
  }

  @HostListener('window:orientationchange')
  onOrientationChange() {
    this.updateSize();
  }

  @HostListener('window:contextmenu', ['$event'])
  onContextMenu(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    return false;
  }

  updateSize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.updateBoard();
  }

  createBoard() {
    let size = Math.min(this.width, this.height, BOARD_SIZE);
    this.boardConfig = {
      rows: this.rows,
      columns: this.columns,
      width: size,
      height: size,
    };

    this.sprite.setContainer(this.container);

    const createTile = this.tileBuilder.createFactory();
    const destroyTile = this.tileBuilder.destroyFactory();
    this.board.create(this.boardConfig, {
      createTile,
      destroyTile,
    });
  }

  updateBoard() {
    let size = Math.min(this.width, this.height, BOARD_SIZE);
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

    const deaths = this.updateLevel(matches);

    // const deaths = matches.map((tile) => tile.die());
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
    const deaths = [];
    const types = matches
      .filter((item, index, array) => {
        return array.indexOf(item) === index;
      })
      .reduce((data, current: Tile) => {
        if (!data[current.type]) {
          data[current.type] = 0;
        }
        if (this.level.isTargetType(current.type as Colors)) {
          deaths.push(current.die('target'));
        } else {
          deaths.push(current.die());
        }
        data[current.type] += 1;
        return data;
      }, {});

    Object.keys(types).forEach((type) => {
      if (this.level.isTargetType(type as Colors)) {
        this.level.updateTarget(type as Colors, types[type]);
      }
      const scoreValue = matches.length * 10;
      this.createScoreEffect(matches[0], scoreValue).subscribe(() => {
        this.level.updateScore(scoreValue);
      });
    });

    return deaths;
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

  createScoreEffect({ row, column }, value: number) {
    const ref = this.sprite.create(EffectScoreComponent);
    const width = this.boardConfig.width / this.boardConfig.columns;
    const height = this.boardConfig.height / this.boardConfig.rows;
    const score = ref.instance;
    score.value = value;
    score.x = width * column + width / 2 - 15;
    score.y = height * row + height / 2 - 15;

    return score.die().pipe(finalize(() => ref.destroy()));
  }
}
