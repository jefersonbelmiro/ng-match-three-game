import {
  animate,
  AnimationBuilder,
  AnimationMetadata,
  group,
  keyframes,
  query,
  style,
} from '@angular/animations';
import { Component, ElementRef, Input } from '@angular/core';
import { Observable, Subscriber, timer } from 'rxjs';
import { tap } from 'rxjs/operators';
import { BoardService } from '../../services/board.service';
import { StateService } from '../../services/state.service';
import { Colors, Monsters, Position, Tile, TileState } from '../../shared';

const random = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

const colors = Object.keys(Colors);
const monsters = Object.keys(Monsters);

@Component({
  selector: 'app-tile',
  templateUrl: './tile.component.html',
  styleUrls: ['./tile.component.scss'],
  host: {
    '[style.left.px]': 'column * width',
    '[style.top.px]': 'row * height',
    '[style.width.px]': 'width',
    '[style.height.px]': 'height',
    '[hidden]': '!visible',
    '[class]': 'type',
  },
})
export class TileComponent implements Tile {
  @Input() row: number;
  @Input() column: number;
  @Input() width: number;
  @Input() height: number;
  @Input() type: string;

  @Input() visible = true;

  state = TileState.Idle;
  spriteUrl: string;
  glowUrl: string;

  constructor(
    private builder: AnimationBuilder,
    private elementRef: ElementRef,
    private board: BoardService,
    private globalState: StateService
  ) {}

  ngOnInit() {
    this.globalState.getState().subscribe((value) => {
      const element = this.elementRef.nativeElement as HTMLElement;
      element.classList.toggle(
        'no-selected',
        !!(value.selected && value.selected !== this)
      );
      element.classList.toggle('selected', value.selected === this);
      element.classList.toggle(
        'selected-adjacent',
        this.isAdjacent(value.selected)
      );
      if (value.selected === this) {
        this.createSelectAnimation();
      }
    });

    timer(2000, 500).subscribe((it) => {
      if (Math.floor(Math.random() * 100) <= 5) {
        this.createSelectAnimation();
      }
    });

    this.glowUrl = `assets/items-effects/glow/${this.type}.png`;
    this.spriteUrl = `assets/monsters/${this.type.toLowerCase()}/sprite.png`;
  }

  private createSelectAnimation() {
    const animation = query('.sprite img', [
      animate(
        '400ms steps(3)',
        keyframes([
          style({ offset: 0, transform: `translateX(0)` }),
          style({ offset: 1, transform: `translateX(-180px)` }),
        ])
      ),
    ]);
    const factory = this.builder.build(animation);
    const player = factory.create(this.elementRef.nativeElement);
    player.play();
    player.onDone(() => {
      player.destroy();
    });
  }

  get alive(): boolean {
    return this.state !== TileState.Dead;
  }

  get idle(): boolean {
    return this.state === TileState.Idle;
  }

  shift({ row, column }: Position) {
    const translateX =  (column * this.width) - (this.column * this.width);
    const translateY =  (row * this.height) - (this.row * this.height);
    const from = {
      // left: this.column * this.width + 'px',
      // top: this.row * this.height + 'px',
      transform: 'translate(0, 0)',
      zIndex: 5,
    };
    const to = {
      // left: column * this.width + 'px',
      // top: row * this.height + 'px',
      transform: `translate(${translateX}px, ${translateY}px)`,
      zIndex: 5,
    };

    // const falling = this.row < 0;
    // const speed = random(150, 250);

    const animations = [
      group([
        style(from),
        animate('250ms ease-in', style(to)),
        // ...(falling ? this.rubberBandAnimation(speed, 250) : []),
      ]),
    ];
    this.state = TileState.Shift;

    return this.animate(animations).pipe(
      tap(() => {
        Object.assign(this, { row, column, state: TileState.Idle });
        this.board.setAt({ row, column }, this);
      })
    );
  }

  rubberBandAnimation(duration: number, delay: number) {
    return [
      animate(
        `${duration}ms ${delay}ms`,
        keyframes([
          style({
            transform: 'scale(1, 1)',
            easing: 'ease',
            offset: 0,
          }),
          style({
            transform: 'scale(1.07, 0.7) translateY(18%)',
            easing: 'ease',
            offset: 0.3,
          }),
          style({
            transform: 'scale(0.9, 1.07) translateY(-8%)',
            easing: 'ease',
            offset: 0.6,
          }),
          style({
            transform: 'scale(1, 1) translateY(0%)',
            easing: 'ease',
            offset: 1,
          }),
        ])
      ),
    ];
  }

  die(animation: 'die' | 'target' = 'die') {
    let translateX = '0';
    const left = this.column * this.width;
    if (left > 160) {
      translateX = '40%';
    }
    if (left < 140) {
      translateX = '-40%';
    }

    const isTargetAnim = animation === 'target';
    const timeSpriteAnim = isTargetAnim ? '300ms 200ms' : '200ms';
    const timeGlowAnim = isTargetAnim ? '600ms' : '200ms';

    const targetAnimation = animate(
      '600ms 200ms',
      keyframes([
        style({
          offset: 0,
          top: this.row * this.height + 'px',
          left: this.column * this.width + 'px',
          transform: 'translate(0, 0)',
        }),
        style({
          offset: 0.3,
          transform: `translate(${translateX}, 80%)`,
        }),
        style({
          offset: 1,
          top: '-80px',
          left: '150px',
          transform: 'translate(0, 0)',
        }),
      ])
    );

    const animations = [
      style({ zIndex: 5 }),
      group([
        query('.glow', [
          animate(
            timeGlowAnim,
            keyframes([
              style({ offset: 0, opacity: 1, transform: 'scale(1)' }),
              style({ offset: 0.7, transform: 'scale(1.8)' }),
              style({ offset: 1, transform: 'scale(0.5)' }),
            ])
          ),
        ]),
        query('.sprite', [
          style({ opacity: 1, transform: 'scale(1)' }),
          animate(timeSpriteAnim, style({ transform: 'scale(0.5)' })),
        ]),
        ...(isTargetAnim ? [targetAnimation] : []),
      ]),
    ];
    this.state = TileState.Dead;

    return new Observable((subscribe: Subscriber<void>) => {
      setTimeout(
        () => {
          this.board.removeAt(this);
          subscribe.next();
          subscribe.complete();
        },
        isTargetAnim ? 400 : 200
      );

      this.animate(animations).subscribe(() => {
        this.board.destroyData(this as Tile);
      });
    });
  }

  animate(
    animation: AnimationMetadata | AnimationMetadata[]
  ): Observable<void> {
    return new Observable((subscribe) => {
      const factory = this.builder.build(animation);
      const player = factory.create(this.elementRef.nativeElement);
      player.onDone(() => {
        subscribe.next();
        subscribe.complete();
        player.destroy();
      });
      player.play();
    });
  }

  private isAdjacent(position: Position) {
    if (
      !position ||
      (this.column !== position.column && this.row !== position.row)
    ) {
      return false;
    }
    const column = Math.abs(position.column - this.column);
    const row = Math.abs(position.row - this.row);
    return Math.max(column, row) <= 1;
  }
}
