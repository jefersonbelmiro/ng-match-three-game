import {
  animate,
  animation,
  keyframes,
  style,
  transition,
  trigger,
  useAnimation,
} from '@angular/animations';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import {
  faArrowsAlt,
  faCheck,
  faStar,
  faStopwatch,
} from '@fortawesome/free-solid-svg-icons';
import { Monsters } from '../../shared';

const heartBeat = animation([
  animate(
    '{{duration}}ms {{delay}}ms',
    keyframes([
      style({ transform: 'scale(1)', offset: 0 }),
      style({ transform: 'scale({{scale}})', offset: 0.5 }),
      style({ transform: 'scale(1)', easing: 'ease-in-out', offset: 1 }),
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
        params: { duration: 300, scale: 1.5, delay: 0 },
      }),
      transition(':decrement', [useAnimation(heartBeat)], {
        params: { duration: 300, scale: 1.5, delay: 0 },
      }),
    ]),
    trigger('targetAnimation', [
      transition(':decrement', [useAnimation(heartBeat)], {
        params: { duration: 300, scale: 1.5, delay: 800 },
      }),
    ]),
  ],
})
export class LevelStatusComponent implements OnChanges {
  @Input() target = [];
  @Input() score = 0;
  @Input() moves = 0;

  icons = {
    star: faStar,
    moves: faArrowsAlt,
    check: faCheck,
    timer: faStopwatch,
  };

  constructor() {}

  getSprite(type: string) {
    return Monsters[type];
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.target) {
    }
  }
}
