import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';

import * as firebase from 'firebase';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.scss'],
})
export class LobbyComponent implements OnInit {
  constructor(private db: AngularFireDatabase, private auth: AuthService) {}

  ngOnInit(): void {
    this.auth.loginAnonymously().then((response) => {
      const refPlayerState = this.db.database.ref(
        `/player_states/${response.user.uid}`
      );
      const refCommands = this.db.database.ref(
        `/commands/${response.user.uid}`
      );
      refCommands.push('match');

      this.db.list('test-write').push('test-value');
    });
  }

  onReady() {
    console.log('ready');
  }

  onCancel() {
    console.log('cancel');
  }
}
