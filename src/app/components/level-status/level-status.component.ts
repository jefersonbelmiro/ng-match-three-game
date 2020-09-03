import { Component, Input } from '@angular/core';
import {
  faStar,
  faArrowsAlt,
  faCheck,
} from '@fortawesome/free-solid-svg-icons';
import {
  trigger,
  animation,
  keyframes,
  AUTO_STYLE,
  useAnimation,
} from '@angular/animations';
import { transition } from '@angular/animations';
import { query, style, group, animate } from '@angular/animations';

const heartBeat = animation([
  animate(
    '{{duration}}ms {{delay}}ms',
    keyframes([
      style({
        visibility: AUTO_STYLE,
        transform: 'scale(1)',
        easing: 'ease-in-out',
        offset: 0,
      }),
      style({
        transform: 'scale({{scale}})',
        easing: 'ease-in-out',
        offset: 0.5,
      }),
      // style({
      //   transform: 'scale({{scale}})',
      //   easing: 'ease-in-out',
      //   offset: 0.14,
      // }),
      // style({ transform: 'scale(1)', easing: 'ease-in-out', offset: 0.28 }),
      // style({
      //   transform: 'scale({{scale}})',
      //   easing: 'ease-in-out',
      //   offset: 0.42,
      // }),
      style({ transform: 'scale(1)', easing: 'ease-in-out', offset: 0.7 }),
    ])
  ),
]);

@Component({
  selector: 'app-level-status',
  templateUrl: './level-status.component.html',
  styleUrls: ['./level-status.component.scss'],
  animations: [
    trigger('valueAnimation', [
      transition(':increment', [useAnimation(heartBeat)], {
        params: {
          duration: 300,
          scale: 1.9,
          delay: 0,
        },
      }),
      transition(':decrement', [useAnimation(heartBeat)], {
        params: {
          duration: 300,
          scale: 1.9,
          delay: 0,
        },
      }),
    ]),
  ],
})
export class LevelStatusComponent {
  @Input() target = [];
  @Input() score = 0;
  @Input() moves = 0;

  icons = {
    star: faStar,
    moves: faArrowsAlt,
    check: faCheck,
  };

  constructor() {}

  ngOnChanges(changes): void {
    console.log('levelstatus change', Object.keys(changes));
  }
}
