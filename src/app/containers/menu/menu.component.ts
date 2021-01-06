import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { timer } from 'rxjs';
import { TileComponent } from '../../components/tile/tile.component';
import { Monsters, Tile } from '../../shared';
import { StateService } from '../../services/state.service';
import { AuthService } from '../../services/auth.service';
import { AngularFireDatabase } from '@angular/fire/database';

import * as firebase from 'firebase';
// import firebase from 'firebase/app'
// import * as firebase from 'firebase';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit {
  tileType: string;
  @ViewChild(TileComponent, { static: true }) tile: TileComponent;

  constructor(
    private router: Router,
    private state: StateService,
    private db: AngularFireDatabase,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.state.set({ scene: 'menu' });
    const monsters = Object.keys(Monsters);
    this.tileType = monsters[Math.floor(Math.random() * 4)];
    timer(1000, 2000).subscribe(() => {
      this.tile.playSelectionAnimation();
    });
  }

  onStart() {
    this.state.set({ scene: 'level' });
    this.router.navigate(['/level']);
  }

  onMatch() {
    // this.auth.loginAnonymously().then((response) => {
    //   const refPlayerState = this.db.database.ref(
    //     `/player_states/${response.user.uid}`
    //   );
    //   const refCommands = this.db.database.ref(
    //     `/commands/${response.user.uid}`
    //   );
    //   refCommands.push('match');
    //
    //   this.db.list('test-write').push('test-value');
    // });

    // this.state.set({ scene: 'level' });
    // this.router.navigate(['/level']);
  }
}
