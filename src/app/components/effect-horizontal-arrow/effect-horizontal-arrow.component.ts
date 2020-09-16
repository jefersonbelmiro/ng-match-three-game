import {
  group,
  style,
  animate,
  keyframes,
  AnimationBuilder,
} from '@angular/animations';
import { Component, Input, ElementRef, OnChanges, OnInit } from '@angular/core';
import { SpriteComponent } from '../sprite/sprite.component';

@Component({
  selector: 'app-effect-horizontal-arrow',
  templateUrl: './effect-horizontal-arrow.component.html',
  styleUrls: ['./effect-horizontal-arrow.component.scss'],
})
export class EffectHorizontalArrowComponent extends SpriteComponent
  implements OnInit, OnChanges {
  spriteUrl: string;

  @Input() type: string;

  ngOnInit() {
    this.setSpriteUrl();
  }

  ngOnChanges() {
    this.setSpriteUrl();
  }

  private setSpriteUrl() {
    this.spriteUrl = `assets/items-effects/arrows/${this.type}_horizontal.png`;
  }

  die() {
    const animation = group([
      animate(
        '300ms',
        keyframes([
          style({ offset: 0, transform: `scale(1, 0)` }),
          style({ offset: 0.3, transform: `scale(5, 3)` }),
          style({ offset: 0.6, opacity: 0.9, transform: `scale(5, 1)` }),
          style({ offset: 1, opacity: 0.3, transform: `scale(5, 0)` }),
        ])
      ),
    ]);
    return this.animate(animation, { destroyOnDone: false });
  }
}
