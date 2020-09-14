import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { Component, HostListener, OnInit } from '@angular/core';
import { StateService } from '../../services/state.service';
import { PowerUps, PowerUp } from '../../shared';

@Component({
  selector: 'app-power-ups',
  templateUrl: './power-ups.component.html',
  styleUrls: ['./power-ups.component.scss'],
  animations: [
    trigger('selectedAnimation', [
      state('selected', style({ transform: 'scale(1.4)', zIndex: 5 })),
      state('idle', style({ transform: 'scale(1)' })),
      transition('idle <=> selected', animate(100)),
    ]),
  ],
})
export class PowerUpsComponent implements OnInit {
  data: PowerUp[] = [];

  sprites = {
    vertical_arrow: 'assets/items-effects/Vertical_arrow.png',
    horizontal_arrow: 'assets/items-effects/Horizontal_arrow.png',
    star: 'assets/items-effects/Star.png',
    axe: 'assets/items-effects/Ax.png',
  };

  selected;

  constructor(private state: StateService) {}

  ngOnInit(): void {
    this.state.getState().subscribe((values) => {
      this.data = values.powerUps;
    });
  }

  @HostListener('window:mousedown')
  @HostListener('window:touchstart')
  onInputDown() {
    this.selected = null;
  }

  onSelect(item: PowerUp) {
    this.selected = item;
    this.state.set({ selected: null, selectedPowerUp: item });
  }

  getItemAnimation(item: PowerUp) {
    return item === this.selected ? 'selected' : 'idle';
  }
}
