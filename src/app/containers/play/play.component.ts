import {
  Component,
  HostListener,
  OnInit,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { Router } from '@angular/router';
import { EMPTY, forkJoin, Observable, ReplaySubject, timer } from 'rxjs';
import { finalize, switchMap, takeUntil } from 'rxjs/operators';
import { EffectScoreComponent } from '../../components/effect-score/effect-score.component';
import { BoardService } from '../../services/board.service';
import { LevelService } from '../../services/level.service';
import { MatchService } from '../../services/match.service';
import { PowerUpService } from '../../services/power-up.service';
import { SpriteService } from '../../services/sprite.service';
import { StateService } from '../../services/state.service';
import { TileService } from '../../services/tile.service';
import { Board, Level, Position, Tile } from '../../shared';

const BOARD_SIZE = 350;

@Component({
  selector: 'app-play',
  templateUrl: './play.component.html',
  styleUrls: ['./play.component.scss'],
})
export class PlayComponent implements OnInit {
  width = 400;
  height = 400;

  rows = 5;
  columns = 5;

  boardData: Board;
  levelData: Level;
  levelComplete: boolean;
  destroyed$ = new ReplaySubject(1);

  @ViewChild('container', { read: ViewContainerRef, static: true })
  container: ViewContainerRef;

  constructor(
    private tileBuilder: TileService,
    private board: BoardService,
    private matches: MatchService,
    private state: StateService,
    private level: LevelService,
    private sprite: SpriteService,
    private powerUp: PowerUpService,
    private router: Router
  ) {
    this.updateSize();
  }

  ngOnInit() {
    this.level
      .getState()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((data) => {
        this.levelData = data;
        if (data.complete && !this.state.isBusy()) {
          this.levelComplete = true;
          timer(2000).subscribe(() => this.router.navigate(['/level']));
        }
      });

    this.createBoard();
  }

  ngOnDestroy() {
    this.sprite.pool.clear();
    this.destroyed$.next();
    this.destroyed$.complete();
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
    this.boardData = {
      rows: this.rows,
      columns: this.columns,
      width: size,
      height: size,
    };

    this.sprite.setContainer(this.container);
    const createTile = this.tileBuilder.createFactory();
    const destroyTile = this.tileBuilder.destroyFactory();

    this.board.create(this.boardData, this.levelData, {
      createTile,
      destroyTile,
    });
  }

  updateBoard() {
    let size = Math.min(this.width, this.height, BOARD_SIZE);
    this.boardData = { ...this.board, width: size, height: size };
    this.board.update(this.boardData);
  }

  onSelect(tile: Tile) {
    const state = this.state.getValue();
    if (state.selectedPowerUp) {
      this.powerUp.execute(state.selectedPowerUp, tile).subscribe((matches) => {
        this.processMatches(matches);
      });
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
    const options = { fallingAnimatin: false };
    const shifts = [
      sourceTile.shift(target, options),
      targetTile.shift(source, options),
    ];
    this.state.setBusy(true);
    return forkJoin(shifts).pipe(
      finalize(() => {
        this.state.setBusy(false);
      })
    );
  }

  processMatches(matches: Tile[]) {
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

  updateLevel(matches: Tile[]) {
    const deaths = [];
    matches
      .filter((item, index, array) => {
        return array.indexOf(item) === index;
      })
      .forEach((current: Tile) => {
        if (this.level.isTargetType(current.type)) {
          deaths.push(
            current.die('target').pipe(
              finalize(() => {
                // total target animation is 800ms
                // die animation complete in 400ms
                // wait more 200ms to update score
                setTimeout(() => {
                  this.level.updateTarget(current.type, 1);
                }, 200);
              })
            )
          );
        } else {
          deaths.push(current.die());
        }
      });

    const scoreValue = matches.length * 10;
    this.createScoreEffect(matches[0], scoreValue).subscribe(() => {
      this.level.updateScore(scoreValue);
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
    const width = this.boardData.width / this.boardData.columns;
    const height = this.boardData.height / this.boardData.rows;
    const score = ref.instance;
    score.value = value;
    score.x = width * column + width / 2 - 15;
    score.y = height * row + height / 2 - 15;

    return score.die().pipe(
      finalize(() => {
        this.sprite.destroy(score);
      })
    );
  }
}
