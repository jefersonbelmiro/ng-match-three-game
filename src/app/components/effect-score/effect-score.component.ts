import { Component, Input, HostBinding } from '@angular/core';
import { SpriteComponent } from '../sprite/sprite.component';
import {
  trigger,
  transition,
  style,
  animate,
  state,
  keyframes,
  animation,
  useAnimation,
  group,
} from '@angular/animations';
import { Sprite } from '../../shared/sprite';
import { targetAnimationFactory } from '../../shared/animations';

@Component({
  selector: 'app-effect-score',
  templateUrl: './effect-score.component.html',
  styleUrls: ['./effect-score.component.scss'],
})
export class EffectScoreComponent extends SpriteComponent {
  @Input() value: number;

  die() {
    const target = { x: 270, y: -70 } as Sprite;
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
