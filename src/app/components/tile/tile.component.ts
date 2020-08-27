import {
  animate,
  AnimationBuilder,
  AnimationMetadata,
  group,
  keyframes,
  query,
  sequence,
  style,
} from '@angular/animations';
import { Component, ElementRef, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { BoardService } from '../../services/board.service';
import { Colors, Position, States, Tile } from '../../shared';

const random = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

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

  state = States.Idle;

  constructor(
    private builder: AnimationBuilder,
    private elementRef: ElementRef,
    private board: BoardService
  ) {}

  ngOnInit() {}

  get color() {
    return Colors[this.type];
  }

  get alive(): boolean {
    return this.state !== States.Dead;
  }

  get idle(): boolean {
    return this.state === States.Idle;
  }

  shift({ row, column }: Position) {
    const from = {
      left: this.column * this.width + 'px',
      top: this.row * this.height + 'px',
      zIndex: 5,
    };
    const to = {
      left: column * this.width + 'px',
      top: row * this.height + 'px',
      zIndex: 5,
    };

    const falling = this.row < 0;
    const speed = random(150, 250);

    const animations = [
      group([
        style(from),
        animate('250ms ease-in', style(to)),
        ...(falling ? this.rubberBandAnimation(speed, 250) : []),
      ]),
    ];
    this.state = States.Shift;

    return this.animate(animations).pipe(
      tap(() => {
        Object.assign(this, { row, column, state: States.Idle });
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

  die() {
    const animations = [
      style({ zIndex: 5 }),
      query('.content', [animate('50ms', style({ borderRadius: '0' }))]),
      sequence([
        animate('80ms', style({ transform: 'scale(1.2)', opacity: 0 })),
        animate('200ms', style({ transform: 'scale(0)', opacity: 1 })),
      ]),
    ];
    this.state = States.Dead;
    return this.animate(animations).pipe(
      tap(() => {
        this.visible = false;
        this.board.removeAt(this);
      })
    );
  }

  animate(
    animation: AnimationMetadata | AnimationMetadata[]
  ): Observable<void> {
    return new Observable((subscribe) => {
      const factory = this.builder.build(animation);
      const player = factory.create(this.elementRef.nativeElement);
      player.onDone(() => {
        player.destroy();
        subscribe.next();
        subscribe.complete();
      });
      player.play();
    });
  }
}
