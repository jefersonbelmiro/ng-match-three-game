import {
  animate,
  animation,
  AnimationBuilder,
  group,
  keyframes,
  query,
  style,
  useAnimation,
} from '@angular/animations';
import { Component, ElementRef, Input } from '@angular/core';
import { Observable, Subscriber, timer } from 'rxjs';
import { tap } from 'rxjs/operators';
import { BoardService } from '../../services/board.service';
import { StateService } from '../../services/state.service';
import { Colors, Monsters, Position, Tile, TileState } from '../../shared';
import { targetAnimationFactory } from '../../shared/animations';
import { Sprite } from '../../shared/sprite';
import { SpriteComponent } from '../sprite/sprite.component';

const random = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

const colors = Object.keys(Colors);
const monsters = Object.keys(Monsters);

const idleAnimation = () => {
  return animation(
    query('.sprite img', [
      animate(
        '400ms steps(2)',
        keyframes([
          style({ offset: 0, transform: `translateX(0)` }),
          style({ offset: 1, transform: `translateX(-120px)` }),
        ])
      ),
    ])
  );
};

const selectionAnimation = () => {
  return animation(
    query(
      '.sprite img',
      animate(
        '400ms',
        keyframes([
          style({ easing: 'steps(1)', transform: `translateX(-240px)` }),
          style({ easing: 'steps(1)', transform: `translateX(-300px)` }),
          style({ easing: 'steps(1)', transform: `translateX(-360px)` }),
          style({ easing: 'steps(1)', transform: `translateX(-420px)` }),
          style({ easing: 'steps(1)', transform: `translateX(-480px)` }),
        ])
      )
    )
  );
};

@Component({
  selector: 'app-tile',
  templateUrl: './tile.component.html',
  styleUrls: ['./tile.component.scss'],
})
export class TileComponent extends SpriteComponent implements Tile {
  @Input() row: number;
  @Input() column: number;
  @Input() type: string;

  get x() {
    return this.column * this.width;
  }

  get y() {
    return this.row * this.height;
  }

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

    this.glowUrl = `assets/items-effects/glow/${this.type}.png`;
    this.spriteUrl = `assets/monsters/${this.type.toLowerCase()}/sprite.png`;
  }

  private playIdleAnimation() {
    return this.animate(idleAnimation()).subscribe();
  }

  private playSelectionAnimation() {
    return this.animate(selectionAnimation()).subscribe();
  }

  get alive(): boolean {
    return this.state !== TileState.Dead;
  }

  get idle(): boolean {
    return this.state === TileState.Idle;
  }

  shift({ row, column }: Position) {
    const translateX = column * this.width - this.x;
    const translateY = row * this.height - this.y;
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