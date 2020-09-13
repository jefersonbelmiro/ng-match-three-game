import { Component, OnInit } from '@angular/core';
import { RouteConfigLoadEnd, Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  constructor(private router: Router) {}

  ngOnInit() {
    this.loadAssets();

    this.router.events.subscribe((event) => {
      if (event instanceof RouteConfigLoadEnd) {
        this.loading = false;
      }
    });
  }

  loadingCount = 1;
  get loading() {
    return this.loadingCount > 0;
  }

  set loading(value: boolean) {
    if (value) {
      this.loadingCount++;
    } else {
      this.loadingCount -= this.loadingCount > 0 ? 1 : 0;
    }
  }

  loadAssets() {
    const assets = [
      'assets/monsters/rabbit/sprite.png',
      'assets/items-effects/glow/Rabbit.png',
      'assets/monsters/unicorn/sprite.png',
      'assets/items-effects/glow/Unicorn.png',
      'assets/monsters/pig/sprite.png',
      'assets/items-effects/glow/Pig.png',
      'assets/monsters/spider/sprite.png',
      'assets/items-effects/glow/Spider.png',
      'assets/items-effects/Vertical_arrow.png',
      'assets/items-effects/Horizontal_arrow.png',
      'assets/items-effects/Star.png',
      'assets/items-effects/Ax.png',
      'assets/monsters/unicorn/Unicorn_1.png',
      'assets/monsters/spider/01.png',
      'assets/monsters/pig/Pig_1.png',
      'assets/monsters/rabbit/Rabbit_1.png',
    ];

    const loadItem = (url: string) => {
      return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = resolve;
        image.onerror = reject;
        image.src = url;
      });
    };

    this.loading = true;
    const requests = assets.map((url) => loadItem(url));
    Promise.all(requests)
      .then(() => {
        this.loading = false;
      })
      .catch(() => {
        this.loading = false;
      });
  }
}
