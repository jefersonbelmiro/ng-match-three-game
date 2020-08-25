import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  width = 400;
  height = 400;

  constructor() {
    window.addEventListener('resize', this.resize.bind(this), false);
    window.addEventListener('orientationchange', this.resize.bind(this), false);
    this.resize();
  }

  resize() {
    let size = Math.min(window.innerWidth, window.innerHeight, 400);
    this.width = size;
    this.height = size;
  }
}
