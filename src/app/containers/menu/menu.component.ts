import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { timer } from 'rxjs';
import { TileComponent } from '../../components/tile/tile.component';
import { Monsters, Tile } from '../../shared';
import { StateService } from '../../services/state.service';
import { AuthService } from '../../services/auth.service';
import { AngularFireDatabase } from '@angular/fire/database';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit {
  tileType: string;
  @ViewChild(TileComponent, { static: true }) tile: TileComponent;

  constructor(private router: Router, private state: StateService, private db: AngularFireDatabase, private auth: AuthService) {}

  ngOnInit(): void {

    console.log('init');
    this.auth.loginAnonymously();

    this.state.set({ scene: 'menu' });
    const monsters = Object.keys(Monsters);
    this.tileType = monsters[Math.floor(Math.random() * 4)];
    timer(1000, 2000).subscribe(() => {
      this.tile.playSelectionAnimation();
    });
  }

  onStart() {

    console.log("try write");
    this.db.list("test-write").push("test-value-2");


    // this.state.set({ scene: 'level' });
    // this.router.navigate(['/level']);
  }
}
