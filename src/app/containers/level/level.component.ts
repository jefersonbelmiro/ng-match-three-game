import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LevelService } from '../../services/level.service';
import { Level } from '../../shared';
import { timer } from 'rxjs';

@Component({
  selector: 'app-level',
  templateUrl: './level.component.html',
  styleUrls: ['./level.component.scss'],
})
export class LevelComponent implements OnInit {
  data: Level;

  constructor(private service: LevelService, private router: Router) {}

  ngOnInit(): void {
    this.service.getState().subscribe((state) => {
      this.data = state;
    });

    this.service.create();

    timer(3000).subscribe(() => {
      this.play();
    });
  }

  @HostListener('click')
  play() {
    this.router.navigate(['/play']);
  }
}
