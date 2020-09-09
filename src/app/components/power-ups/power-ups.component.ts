import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { Component, HostListener, OnInit } from '@angular/core';

@Component({
  selector: 'app-power-ups',
  templateUrl: './power-ups.component.html',
  styleUrls: ['./power-ups.component.scss'],
  animations: [
    trigger('selectedAnimation', [
      state('selected', style({ transform: 'scale(1.4)' })),
      state('idle', style({ transform: 'scale(1)' })),
      transition('idle <=> selected', animate(100)),
    ]),
  ],
})
export class PowerUpsComponent implements OnInit {
  data = [
    {
      value: 0,
      type: 'vertical_arrow',
      selected: false,
    },
    {
      value: 1,
      type: 'horizontal_arrow',
      selected: false,
    },
    {
      value: 5,
      type: 'star',
      selected: false,
    },
    {
      value: 10,
      type: 'axe',
      selected: false,
    },
  ];

  sprites = {
    vertical_arrow: 'assets/items-effects/Vertical_arrow.png',
    horizontal_arrow: 'assets/items-effects/Horizontal_arrow.png',
    star: 'assets/items-effects/Star.png',
    axe: 'assets/items-effects/Ax.png',
  };

  selected;

  constructor() {}

  ngOnInit(): void {}

  @HostListener('window:mousedown')
  @HostListener('window:touchstart')
  onInputDown() {
    this.selected = null;
  }

  onSelect(item) {
    this.selected = item;
  }

  getItemAnimation(item) {
    return item === this.selected ? 'selected' : 'idle';
  }
}
