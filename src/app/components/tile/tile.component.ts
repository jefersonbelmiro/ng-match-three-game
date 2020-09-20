import {
  animate,
  AnimationBuilder,
  group,
  keyframes,
  query,
  style,
  useAnimation,
} from '@angular/animations';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostBinding,
  Input,
  OnChanges,
} from '@angular/core';
import { Observable, Subscriber, timer } from 'rxjs';
import { tap } from 'rxjs/operators';
import { BoardService } from '../../services/board.service';
import { StateService } from '../../services/state.service';
import { Position, Tile, TileState } from '../../shared';
import { targetAnimationFactory } from '../../shared/animations';
import { Sprite } from '../../shared/sprite';
import { SpriteComponent } from '../sprite/sprite.component';

const random = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

@Component({
  selector: 'app-tile',
  templateUrl: './tile.component.html',
  styleUrls: ['./tile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TileComponent extends SpriteComponent implements Tile, OnChanges {
  @Input() type: string;

  @HostBinding('class.absolute') get isAbsolute() {
    return this.x !== undefined || this.y !== undefined;
  }

  @Input() width = 70;
  @Input() height = 70;

  @Input() row: number;
  @Input() column: number;

  state = TileState.Idle;
  spriteUrl: string;
  glowUrl: string;

  constructor(
    protected board: BoardService,
    protected globalState: StateService,
    protected builder: AnimationBuilder,
    protected elementRef: ElementRef
  ) {
    super(elementRef, builder);
  }

  ngOnChanges() {
    this.update();
  }

  ngOnInit() {
    this.update();

    this.globalState.getState().subscribe((value) => {
      const element = this.elementRef.nativeElement as HTMLElement;
      element.classList.toggle(
        'no-selected',
        !!(value.selected && value.selected !== this)
      );
      element.classList.toggle('selected', value.selected === this);
      element.classList.toggle(
        'selected-adjacent',
        this.board.isAdjacent(this, value.selected)
      );
      if (value.selected === this) {
        this.playSelectionAnimation();
      }
    });

    timer(1000, random(500, 1500)).subscribe(() => {
      if (this.idle && Math.floor(Math.random() * 100) <= 5) {
        this.playIdleAnimation();
      }
    });
  }

  private update() {
    this.glowUrl = `assets/items-effects/glow/${this.type}.png`;
    this.spriteUrl = `assets/monsters/${this.type.toLowerCase()}/sprite.png`;
    if (this.column !== undefined) {
      this.x = this.column * this.width;
    }
    if (this.row !== undefined) {
      this.y = this.row * this.height;
    }
  }

  private playIdleAnimation() {
    const animations = [
      query('.sprite img', [
        animate(
          '400ms steps(2)',
          keyframes([
            style({ transform: `translateX(0)` }),
            style({ transform: `translateX(-120px)` }),
          ])
        ),
      ]),
    ];
    return this.animate(animations).subscribe();
  }

  playSelectionAnimation() {
    const animations = [
      query(
        '.sprite img',
        animate(
          '400ms steps(4)',
          keyframes([
            style({ transform: `translateX(-240px)` }),
            style({ transform: `translateX(-480px)` }),
          ])
        )
      ),
    ];
    return this.animate(animations).subscribe();
  }

  get alive(): boolean {
    return this.state !== TileState.Dead;
  }

  get idle(): boolean {
    return this.state === TileState.Idle;
  }

  shift({ row, column }: Position, options = { fallingAnimatin: true }) {
    const translateX = column * this.width - this.x;
    const translateY = row * this.height - this.y;

    const falling = options.fallingAnimatin && row > this.row;
    const speed = random(150, 250);

    const animations = [
      group([
        style({ transform: 'translate(0, 0)', zIndex: 5 }),
        animate(
          '250ms ease-in',
          style({
            transform: `translate(${translateX}px, ${translateY}px)`,
            zIndex: 5,
          })
        ),
        ...(falling ? this.rubberBandAnimation(speed, 250) : []),
      ]),
    ];

    this.state = TileState.Shift;
    return this.animate(animations).pipe(
      tap(() => {
        Object.assign(this, { row, column, state: TileState.Idle });
        this.update();
        this.board.setAt({ row, column }, this);
      })
    );
  }

  rubberBandAnimation(duration: number, delay: number) {
    return [
      query(
        '.sprite img',
        animate(
          '400ms 100ms steps(4)',
          keyframes([
            style({ transform: `translateX(-180px)` }),
            style({ transform: `translateX(-420px)` }),
          ])
        )
      ),

      query(
        '.sprite',
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
        )
      ),
    ];
  }

  die(animation: 'die' | 'target' = 'die') {
    const isTargetAnim = animation === 'target';
    const timeSpriteAnim = isTargetAnim ? '300ms 200ms' : '200ms';
    const timeGlowAnim = isTargetAnim ? '600ms' : '200ms';

    const target = { x: 150, y: -80 } as Sprite;
    const params = { params: { duration: 600, delay: 200 } };
    const targetAnimation = useAnimation(
      targetAnimationFactory(this, target),
      params
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
}
