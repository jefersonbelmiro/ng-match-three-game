import { Component, OnInit, Input, HostBinding } from '@angular/core';
import { trigger, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-level-end',
  templateUrl: './level-end.component.html',
  styleUrls: ['./level-end.component.scss'],
  animations: [
    trigger('anim', [
      transition(':enter', [
        style({ transform: 'translateY(-100%)' }),
        animate('400ms', style({ transform: 'translateY(0)' }))
      ])
    ]),
  ],
})
export class LevelEndComponent implements OnInit {
  @HostBinding('@anim') animState: string;

  @Input() current = 0;

  constructor() {}

  ngOnInit(): void {}
}
