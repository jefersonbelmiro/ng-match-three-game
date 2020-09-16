import {
  animate,
  group,
  keyframes,
  style,
  useAnimation,
  query,
} from '@angular/animations';
import { Component, Input, OnInit } from '@angular/core';
import { targetAnimationFactory } from '../../shared/animations';
import { Sprite } from '../../shared/sprite';
import { SpriteComponent } from '../sprite/sprite.component';

@Component({
  selector: 'app-effect-axe',
  templateUrl: './effect-axe.component.html',
  styleUrls: ['./effect-axe.component.scss'],
})
export class EffectAxeComponent extends SpriteComponent implements OnInit {
  spriteUrl: string;
  x = 247;
  y = 362;
  width = 70;
  height = 70;

  @Input() type: string;

  ngOnInit() {
    this.spriteUrl = 'assets/items-effects/Ax.png';
  }

  die(target: Sprite) {
    const targetX = target.x - this.x;
    const targetY = target.y - this.y;
    const duration = 200 + Math.abs(targetY);

    const animation = group([
      query(
        'img',
        animate(
          `${duration}ms`,
          keyframes([
            style({ transform: `rotate(0)` }),
            style({ transform: `rotate(-360deg)` }),
            style({ transform: `rotate(-720deg)` }),
          ])
        )
      ),
      animate(
        `${duration}ms`,
        keyframes([
          style({ offset: 0, transform: `scale(2) rotate(0) translate(0, 0)` }),
          style({
            offset: 0.6,
            transform: `scale(1) translate(0)`,
          }),
          style({
            offset: 1,
            transform: `scale(1) translate(${targetX}px, ${targetY}px)`,
          }),
        ])
      ),
    ]);
    return this.animate(animation);
  }
}
