import {
  animate,
  group,
  keyframes,
  style,
  useAnimation,
} from '@angular/animations';
import { Component, Input } from '@angular/core';
import { targetAnimationFactory } from '../../shared/animations';
import { Sprite } from '../../shared/sprite';
import { SpriteComponent } from '../sprite/sprite.component';

@Component({
  selector: 'app-effect-score',
  templateUrl: './effect-score.component.html',
  styleUrls: ['./effect-score.component.scss'],
})
export class EffectScoreComponent extends SpriteComponent {
  @Input() value: number;

  die(to?: { x: number; y: number }) {
    const target = (to || { x: 270, y: -70 }) as Sprite;
    const params = { params: { delay: 500, duration: 700 } };
    const animation = group([
      style({ transform: 'scale(0)' }),
      animate(
        '500ms',
        keyframes([
          style({ offset: 0.5, transform: 'scale(2)' }),
          style({ offset: 1, transform: 'scale(1)' }),
        ])
      ),

      animate('300ms 700ms', style({ opacity: 0.5 })),
      useAnimation(targetAnimationFactory(this, target), params),
    ]);
    return this.animate(animation);
  }
}
