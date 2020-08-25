import { Component, Input, ElementRef, HostBinding } from '@angular/core';
import { Tile, Colors, Position, States } from '../../shared';
import { Observable } from 'rxjs';
import {
  style,
  animate,
  AnimationBuilder,
  query,
  sequence,
  trigger,
  transition,
  AnimationMetadata,
} from '@angular/animations';

import { tap } from 'rxjs/operators';
import { BoardService } from '../../services/board.service';

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
    const animations = [style(from), animate('250ms ease-in', style(to))];
    this.state = States.Shift;
    return this.animate(animations).pipe(
      tap(() => {
        Object.assign(this, { row, column, state: States.Idle });
        this.board.setAt({ row, column }, this);
      })
    );
  }

  die() {
    const animations = [
      style({ zIndex: 5 }),
      query('.content', [animate('50ms', style({ borderRadius: '0' }))]),
      sequence([
        animate('80ms', style({ transform: 'scale(1.2)', opacity: 1 })),
        animate('250ms', style({ transform: 'scale(0)', opacity: 1 })),
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
