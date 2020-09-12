import { animate, animation, keyframes, style } from '@angular/animations';
import { Sprite } from './sprite';

export const targetAnimationFactory = (source: Sprite, target: Sprite) => {
  let bounceTranslateX = '0';
  let translateX = target.x - source.x;
  let translateY = target.y - source.y;
  const half = source.width / 2;
  if (source.x > target.x + half) {
    bounceTranslateX = '40%';
  }
  if (source.x < target.x - half) {
    bounceTranslateX = '-40%';
  }
  return animation(
    animate(
      '{{ duration }}ms {{ delay }}ms',
      keyframes([
        style({
          offset: 0,
          transform: 'translate(0, 0)',
        }),
        style({
          offset: 0.3,
          transform: `translate(${bounceTranslateX}, 80%)`,
        }),
        style({
          offset: 1,
          transform: `translate(${translateX}px, ${translateY}px)`,
        }),
      ])
    )
  );
};
