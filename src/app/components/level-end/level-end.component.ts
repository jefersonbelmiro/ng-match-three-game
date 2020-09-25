import { animate, group, query, style, transition, trigger } from '@angular/animations';
import { Component, HostBinding, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { faRedoAlt, faStepForward, faStar as faStarFill } from '@fortawesome/free-solid-svg-icons';
import { faStar } from '@fortawesome/free-regular-svg-icons';
import { ReplaySubject } from 'rxjs';
import { LevelService } from '../../services/level.service';

@Component({
  selector: 'app-level-end',
  templateUrl: './level-end.component.html',
  styleUrls: ['./level-end.component.scss'],
  animations: [
    trigger('anim', [
      transition(':enter', [
        group([
          query('.content', [
            style({ transform: 'translateY(-100%)', opacity: 0 }),
            animate(
              '200ms 300ms',
              style({ transform: 'translateY(0)', opacity: 1 })
            ),
          ]),
          style({ opacity: 0 }),
          animate('400ms', style({ opacity: 1 })),
        ]),
      ]),
    ]),
  ],
})
export class LevelEndComponent implements OnInit, OnDestroy {
  @HostBinding('@anim') animState: string;

  @Input() current = 0;

  icons = {
    replay: faRedoAlt,
    next: faStepForward,
    star: faStar,
    starFill: faStarFill,
  };

  destroyed$ = new ReplaySubject(1);

  constructor(private router: Router, private level: LevelService) {}

  ngOnInit(): void {
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  onReplay() {
    this.level.set({ complete: false });
    this.router.navigate(['/level']);
  }

  onNext() {
    this.router.navigate(['/level']);
  }
}
