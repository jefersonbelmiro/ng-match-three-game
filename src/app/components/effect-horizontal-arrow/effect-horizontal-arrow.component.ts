import { group, style, animate, keyframes } from '@angular/animations';
import { Component, Input } from '@angular/core';
import { SpriteComponent } from '../sprite/sprite.component';

@Component({
  selector: 'app-effect-horizontal-arrow',
  templateUrl: './effect-horizontal-arrow.component.html',
  styleUrls: ['./effect-horizontal-arrow.component.scss'],
})
export class EffectHorizontalArrowComponent extends SpriteComponent {
  leftUrl: string;
  horizontalUrl: string;
  rightUrl: string;

  @Input() type: string;

  ngOnInit() {
    this.spriteUrl = `assets/items-effects/arrows/${this.type}_horizontal.png`;
    console.log('ngOnInit');
  }

  die() {
    const startX = 0;
    const endX = -150;
    console.log('die', startX, this.x);

    this.x = 140;
    // this.y = 0;
    const animation = group([

      animate(
        '300ms',
        keyframes([
          style({ transform: `scale(1)` }),
          style({ transform: `scale(5, 1.5)`  }),
          style({ opacity: 0.7, transform: `scale(5, 1)`  }),
          style({ opacity: 0.0, transform: `scale(5, 1)`  }),
        ])
      ),
    ]);
    return this.animate(animation,  { destroyOnDone: false });
  }
}
