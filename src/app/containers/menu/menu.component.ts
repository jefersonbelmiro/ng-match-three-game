import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { timer } from 'rxjs';
import { TileComponent } from '../../components/tile/tile.component';
import { Monsters, Tile } from '../../shared';
import { StateService } from '../../services/state.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit {
  tileData: Tile;

  @ViewChild(TileComponent, { static: true }) tile: TileComponent;

  constructor(private router: Router, private state: StateService) {}

  ngOnInit(): void {
    const monsters = Object.keys(Monsters);
    const type = monsters[Math.floor(Math.random() * 4)];
    this.tileData = {
      row: 0,
      column: 0,
      width: 70,
      height: 70,
      type,
    } as Tile;

    timer(1000, 2000).subscribe(() => {
      this.tile.playSelectionAnimation();
    });
  }

  onStart() {
    this.state.set({ scene: 'play' });
    this.router.navigate(['/play']);
  }
}
