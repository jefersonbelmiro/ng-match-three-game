import { animate, keyframes, style, group } from '@angular/animations';
import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { SpriteComponent } from '../sprite/sprite.component';

@Component({
  selector: 'app-effect-vertical-arrow',
  templateUrl: './effect-vertical-arrow.component.html',
  styleUrls: ['./effect-vertical-arrow.component.scss'],
})
export class EffectVerticalArrowComponent extends SpriteComponent
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
    this.spriteUrl = `assets/items-effects/arrows/${this.type}_vertical.png`;
  }

  die() {
    const animation = group([
      animate(
        '300ms',
        keyframes([
          style({ offset: 0, transform: `scale(0, 1)` }),
          style({ offset: 0.3, transform: `scale(3, 5)` }),
          style({ offset: 0.6, opacity: 0.9, transform: `scale(1, 5)` }),
          style({ offset: 1, opacity: 0.3, transform: `scale(0, 5)` }),
        ])
      ),
    ]);
    return this.animate(animation);
  }
}
