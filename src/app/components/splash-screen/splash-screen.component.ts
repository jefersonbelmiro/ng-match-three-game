import {
  animate,
  state,
  style,
  transition,
  trigger,
  keyframes,
  query,
  group,
  animation,
} from '@angular/animations';
import { Component, HostBinding, OnInit } from '@angular/core';

@Component({
  selector: 'app-splash-screen',
  templateUrl: './splash-screen.component.html',
  styleUrls: ['./splash-screen.component.scss'],
  animations: [
    trigger('fadeOut', [
      transition(':leave', [
        group([
          animate(
            '300ms 300ms ease-out',
            keyframes([
              style({ opacity: 1 }),
              style({ opacity: 0 }),
            ])
          ),
        ]),
      ]),
    ]),

    trigger('fadeIn', [
      state('void', style({ opacity: 0 })),
      state('*', style({ opacity: 1 })),
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms 300ms', style({ opacity: 1 })),
      ]),
    ]),
  ],
})
export class SplashScreenComponent implements OnInit {
  @HostBinding('@fadeOut') fadeOut: string;

  constructor() {}

  ngOnInit(): void {}
}
