import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { Component, OnInit, HostListener } from '@angular/core';
import { StateService } from '../../services/state.service';
import { PowerUp } from '../../shared';

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
  selected: PowerUp;

  sprites = {
    vertical_arrow: 'assets/items-effects/Vertical_arrow.png',
    horizontal_arrow: 'assets/items-effects/Horizontal_arrow.png',
    star: 'assets/items-effects/Star.png',
    axe: 'assets/items-effects/Ax.png',
  };

  constructor(private state: StateService) {}

  ngOnInit(): void {
    this.state.getState().subscribe((state) => {
      this.data = state.powerUps;
      this.selected = state.selectedPowerUp;
    });
  }

  onSelect(item: PowerUp) {
    let selectedPowerUp = item;
    if (this.selected === item) {
      selectedPowerUp = null;
    }
    this.selected = selectedPowerUp;
    this.state.set({ selected: null, selectedPowerUp });
  }

  getItemAnimation(item: PowerUp) {
    return item === this.selected ? 'selected' : 'idle';
  }

  @HostListener('touchstart', ['$event'])
  onInputDown(event: MouseEvent) {
    console.log('touchstart', event.target);
    if (event.cancelable) {
      event.preventDefault();
      event.stopPropagation();
    }
    (event.target as HTMLElement).click();
  }
}
