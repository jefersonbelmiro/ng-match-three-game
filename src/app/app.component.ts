import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  width = 400;
  height = 400;

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

  updateSize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
  }
}
