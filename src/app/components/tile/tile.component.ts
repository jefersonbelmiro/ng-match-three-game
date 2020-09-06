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
import { Colors, Position, TileState, Tile, Monsters } from '../../shared';

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

  constructor(
    private builder: AnimationBuilder,
    private elementRef: ElementRef,
    private board: BoardService
  ) {}

  ngOnInit() {}

  get color() {
    const index = monsters.indexOf(this.type);
    return colors[index];
  }

  get glowUrl() {
    return `assets/Items-effects/Glow/${this.type}.png`;
  }

  get image() {
    return Monsters[this.type];
    // return 'assets/Cat/Cat_1.png';
    // return 'assets/Dragon/Head_1.png';
    // return 'assets/Lizard/Lizard_1.png';
    // return 'assets/Octopus/Octopus_1.png';
    // return 'assets/Owl/Owl_1.png';
    // return 'assets/Pig/Pig_1.png';
    // return 'assets/Rabbit/Rabbit_1.png';
    // return 'assets/Rainbow/Rainbow_1.png';
    // return 'assets/Sheep/Sheep_1.png';
    // return 'assets/Spider/Spider_1.png';
    // return 'assets/Unicorn/Unicorn_1.png';
  }

  get alive(): boolean {
    return this.state !== TileState.Dead;
  }

  get idle(): boolean {
    return this.state === TileState.Idle;
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

  die() {
    const animations = [
      style({ zIndex: 5 }),
      group([
        query('.glow', [
          style({ opacity: 1 }),
          animate('300ms', style({ transform: 'scale(1.8)', opacity: '0.5' })),
        ]),
        query('.content', [
          style({ opacity: 1, transform: 'scale(1)' }),
          animate('300ms', style({ transform: 'scale(0.5)', opacity: '0.5' })),
        ]),
        animate(
          '300ms 100ms',
          keyframes([
            style({
              offset: 0,
              top: this.row * this.height + 'px',
              left: this.column * this.width + 'px',
              transform: 'translate(0, 0)',
            }),
            style({
              offset: 0.5,
              transform: 'translate(20%, 70%)',
            }),
            style({
              offset: 1,
              top: '-80px',
              left: '150px',
              transform: 'translate(0, 0)',
            }),
          ])
        ),
      ]),
    ];
    this.state = TileState.Dead;
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
