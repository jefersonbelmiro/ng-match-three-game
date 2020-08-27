import {
  Component,
  ElementRef,
  HostListener,
  Input,
  OnInit,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { EMPTY, forkJoin, Observable } from 'rxjs';
import { switchMap, finalize, tap } from 'rxjs/operators';
import { BoardService } from '../../services/board.service';
import { MatchService } from '../../services/match.service';
import { TileService } from '../../services/tile.service';
import { Board, Position, Tile } from '../../shared';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
  host: {
    '[style.width.px]': 'width',
    '[style.height.px]': 'height',
  },
})
export class BoardComponent implements Board, OnInit {
  @Input() width: number;
  @Input() height: number;

  @Input() rows: number = 5;
  @Input() columns: number = 5;

  @ViewChild('container', { read: ViewContainerRef, static: true })
  container: ViewContainerRef;

  state: {
    busy?: number;
    source?: Tile;
    pointer?: { x: number; y: number };
  };

  constructor(
    private elementRef: ElementRef,
    private service: BoardService,
    private tileService: TileService,
    private matches: MatchService
  ) {}

  ngOnInit(): void {
    const tileFactory = ({ row, column }) => {
      const data = this.tileService.buildData({ row, column }, this);
      return this.tileService.createComponent(data, this.container);
    };
    this.service.create(this, tileFactory);
    this.state = { source: null, pointer: null, busy: 0 };
  }

  @HostListener('mousedown', ['$event'])
  onInputDown(event: MouseEvent) {
    const element = this.elementRef.nativeElement as HTMLElement;
    const rect = element.getBoundingClientRect();
    const width = this.width / this.columns;
    const height = this.height / this.rows;
    const column = Math.floor((event.clientX - rect.left) / width);
    const row = Math.floor((event.clientY - rect.top) / height);
    const source = this.service.getAt({ row, column });

    if (this.state.busy || !source || !source.idle) {
      return;
    }

    this.state.pointer = { x: event.clientX, y: event.clientY };
    this.state.source = source;
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    const { pointer, source, busy } = this.state;

    if (busy || !pointer || !source || !source.idle) {
      return;
    }

    const distX = event.clientX - pointer.x;
    const distY = event.clientY - pointer.y;
    const min = Math.min(
      this.width / this.columns / 2,
      this.height / this.rows / 2
    );

    if (Math.abs(distX) <= min && Math.abs(distY) <= min) {
      return;
    }

    this.state = { ...this.state, pointer: null, source: null };

    let { row, column } = source;
    if (Math.abs(distX) > Math.abs(distY)) {
      column = distX > 0 ? column + 1 : column - 1;
    } else {
      row = distY > 0 ? row + 1 : row - 1;
    }
    const target = this.service.getAt({ row, column });
    if (!target || !target.idle) {
      return;
    }

    this.swap(source, target).subscribe(() => {
      const matches = [
        ...this.matches.find(source),
        ...this.matches.find(target),
      ];
      if (!matches.length) {
        return this.swap(source, target).subscribe();
      }
      this.processMatches(matches);
    });
  }

  swap(source: Position, target: Position) {
    const sourceTile = this.service.getAt(source);
    const targetTile = this.service.getAt(target);
    const shifts = [sourceTile.shift(target), targetTile.shift(source)];
    this.state.busy++;
    return forkJoin(shifts).pipe(
      finalize(() => {
        this.state.busy--;
      })
    );
  }

  processMatches(matches: Tile[]) {
    this.state.busy++;
    const deaths = matches.map((tile) => tile.die());
    forkJoin(deaths.length ? deaths : EMPTY)
      .pipe(
        switchMap(() => this.fill()),
        finalize(() => this.state.busy--)
      )
      .subscribe(() => {
        this.processMatches(this.matches.find());
      });
  }

  fill() {
    const data$: Observable<void>[] = [];
    for (let column = 0; column < this.columns; column++) {
      let shift = 0;
      const shiftData = [];
      for (let row = this.rows - 1; row >= 0; row--) {
        const tile = this.service.getAt({ row, column } as Position);
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
        const tile = this.service.crateAt({ row: row - shift, column });
        const stream$ = tile.shift({ row, column });
        data$.push(stream$);
      });
    }

    return data$.length ? forkJoin(data$) : EMPTY;
  }
}
