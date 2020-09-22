import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { LevelService } from '../../services/level.service';
import { Level } from '../../shared';
import { timer, ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-level',
  templateUrl: './level.component.html',
  styleUrls: ['./level.component.scss'],
})
export class LevelComponent implements OnInit, OnDestroy {
  data: Level;
  destroyed$ = new ReplaySubject(1);

  constructor(private service: LevelService, private router: Router) {
    this.service.create();
    this.service
      .getState()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((state) => {
        this.data = state;
      });
  }

  ngOnInit(): void {
    timer(4000)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(() => {
        this.play();
      });
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  @HostListener('click')
  play() {
    this.router.navigate(['/play']);
  }
}
