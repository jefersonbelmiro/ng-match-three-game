import {
  animate,
  group,
  keyframes,
  query,
  style,
  transition,
  trigger,
} from '@angular/animations';
import {
  Component,
  HostBinding,
  HostListener,
  OnInit,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { EMPTY, forkJoin, Observable } from 'rxjs';
import { finalize, switchMap } from 'rxjs/operators';
import { EffectScoreComponent } from '../../components/effect-score/effect-score.component';
import { BoardService } from '../../services/board.service';
import { LevelService } from '../../services/level.service';
import { MatchService } from '../../services/match.service';
import { SpriteService } from '../../services/sprite.service';
import { StateService } from '../../services/state.service';
import { TileService } from '../../services/tile.service';
import { Board, Colors, Position, Tile, PowerUp, PowerUps } from '../../shared';
import { EffectHorizontalArrowComponent } from '../../components/effect-horizontal-arrow/effect-horizontal-arrow.component';

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
                style({ transform: 'translateY(-50%)', opacity: 0 }),
                style({ transform: 'translateY(0)', opacity: 1 }),
              ])
            ),
          ]),

          query('app-board', [
            style({ transform: 'scale(0)' }),
            animate(
              '400ms 350ms',
              keyframes([
                style({ transform: 'scale(0.5)', opacity: 0 }),
                style({ transform: 'scale(1)', opacity: 1 }),
              ])
            ),
          ]),

          query('app-power-ups', [
            style({ transform: 'scale(0)' }),
            animate(
              '300ms 350ms',
              keyframes([
                style({ transform: 'translateY(50%)', opacity: 0 }),
                style({ transform: 'translateY(0)', opacity: 1 }),
              ])
            ),
          ]),
        ]),
      ]),
    ]),
  ],
})
export class PlayComponent implements OnInit {
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

  onSelect(tile: Tile) {
    const state = this.state.getValue();
    if (state.selectedPowerUp) {
      this.executePowerUp(state.selectedPowerUp, tile);
      this.state.set({ selectedPowerUp: null, selected: null });
    }
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

  executePowerUp(powerUp: PowerUp, target: Tile) {
    if (powerUp.type === PowerUps.HorizontalArrow) {
      const ref = this.sprite.create(EffectHorizontalArrowComponent);
      ref.instance.type = target.type;
      ref.instance.x = 140;
      ref.instance.y = target.y;
      ref.instance.die().subscribe(() => ref.destroy());

      const matches = [target];
      for (let column = 0; column < this.board.columns; column++) {
        const tile = this.board.getAt({ row: target.row, column });
        if (tile && tile !== target) {
          matches.push(tile);
        }
      }

      this.processMatches(matches);
    }
  }
}
