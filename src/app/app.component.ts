import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  width = 400;
  height = 400;

  // backgroundUrl = 'assets/game_background_3/game_background_3.1.png';
  // backgroundUrl = 'assets/game_background_1/game_background_1.png';
  // backgroundUrl = 'assets/game_background_2/game_background_2.png';
  // backgroundUrl = 'assets/game_background_4/game_background_4.png';

  backgroundUrl = 'assets/game_background_3/layers/sky.png';

  constructor() {
    this.updateSize();
  }

  @HostListener('window:resize')
  onResize() {
    this.updateSize();
  }

  @HostListener('window:orientationchange')
  onOrientationChange() {
    this.updateSize();
  }

  @HostListener('window:contextmenu', ['$event']) onContextMenu(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    return false;
  }

  updateSize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
  }
}
