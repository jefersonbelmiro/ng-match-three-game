import { Component, Input, HostBinding } from '@angular/core';
import {
  animate,
  trigger,
  transition,
  group,
  query,
  style,
  sequence,
} from '@angular/animations';

@Component({
  selector: 'app-level-intro',
  templateUrl: './level-intro.component.html',
  styleUrls: ['./level-intro.component.scss'],
  animations: [
    trigger('easeIn', [
      transition(
        ':enter',
        group([
          query('.current', [
            style({ opacity: 0.5, transform: 'translateY(122px) scale(2)', }),
            sequence([
              animate('600ms ease-out', style({ transform: 'translateY(122.5px) scale(1)', opacity: 1, })),
              animate('200ms 100ms ease-out', style({ transform: 'translateY(69.5px) scale(1)' })),
              animate('200ms 100ms ease-out', style({ transform: 'translateY(0)' })),
            ]),
          ]),

          query('.target', [
            style({ opacity: 0, transform: 'translate(100px, 69.5px)' }),
            sequence([
              animate( '200ms 800ms ease-out', style({ opacity: 1, transform: 'translate(0, 69.5px)' })),
              animate( '200ms ease-out', style({ opacity: 1, transform: 'translate(0)' })),
            ]),
          ]),

          query('.moves', [
            style({ opacity: 0, transform: 'translateX(100px)' }),
            animate('200ms 1100ms ease-out', style({ opacity: 1, transform: 'translateX(0)' })
            ),
          ]),
        ])
      ),
    ]),
  ],
})
export class LevelIntroComponent {
  @HostBinding('@easeIn') easeIn: string;

  @Input() current = 0;
  @Input() target = [];
  @Input() moves = 0;

  constructor() {}
}
