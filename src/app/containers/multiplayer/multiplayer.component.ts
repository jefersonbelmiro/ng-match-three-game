import { Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { DatabaseReference } from '@angular/fire/database/interfaces';
import { Router } from '@angular/router';
import firebase from 'firebase/app';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { BoardService } from '../../services/board.service';
import { SpriteService } from '../../services/sprite.service';
import { StateService } from '../../services/state.service';
import { TileService } from '../../services/tile.service';
import { Board, MultiplayerData, Tile } from '../../shared';

interface Update {
  type: 'shift' | 'die' | 'powerUp';
  ownerID: string;
  target: { row: number; column: number };
  source?: { row: number; column: number };
}

@Component({
  selector: 'app-multiplayer',
  templateUrl: './multiplayer.component.html',
  styleUrls: ['./multiplayer.component.scss'],
})
export class MultiplayerComponent implements OnInit {
  @ViewChild('container', { read: ViewContainerRef, static: true })
  container: ViewContainerRef;

  boardData: Board;
  multiplayerData: MultiplayerData;

  refUpdateChanges: DatabaseReference;
  refCommands: DatabaseReference;

  constructor(
    private tileBuilder: TileService,
    private board: BoardService,
    private sprite: SpriteService,
    private state: StateService,
    private router: Router,
    private firebase: AngularFireDatabase
  ) {
    let size = 350;
    this.boardData = {
      rows: 5, // @TODO - get from data.length
      columns: 5, // @TODO - get from data[0].length
      width: size,
      height: size,
    };
  }

  ngOnInit(): void {
    this.sprite.setContainer(this.container);
    const currentState = this.state.getValue();
    if (!currentState?.multiplayer?.gameId) {
      this.router.navigate(['/']);
      return;
    }

    const multiplayerData = currentState.multiplayer;
    this.multiplayerData = currentState.multiplayer;
    this.refCommands = this.firebase.database.ref(
      `/commands/${multiplayerData.player.uid}`
    );
    this.firebase.database
      .ref(`/games/${multiplayerData.gameId}/board`)
      .once('value')
      .then((snapshot) => {
        try {
          this.createBoard(snapshot.val());
          this.refUpdateChanges = this.firebase.database.ref(
            `/games/${multiplayerData.gameId}/updates`
          );
          this.refUpdateChanges.on('child_added', this.onUpdateChanges);
        } catch (err) {
          console.error('board err', err);
        }
      });
  }

  onUpdateChanges = (snapshot: firebase.database.DataSnapshot) => {
    const update: Update = snapshot.val();
    console.log('onUpdateChanges', update);
    if (!update) {
      return;
    }
    if (
      update.ownerID === this.multiplayerData.player.uid ||
      update.type !== 'shift'
    ) {
      return;
    }

    this.doSwap(update.source as Tile, update.target as Tile).subscribe();
  };

  createBoard(data: number[][]) {
    const createTile = this.tileBuilder.createFactory();
    const destroyTile = this.tileBuilder.destroyFactory();
    this.board.createFromServer(this.boardData, data, {
      createTile,
      destroyTile,
    });
  }

  onSelect(tile: Tile) {
    console.log('onSelect', { tile });
  }

  onSwap({ source, target }) {
    const payload = {
      command: 'move',
      gameId: this.multiplayerData.gameId,
      owner: this.multiplayerData.player.uid,
      source: { row: source.row, column: source.column },
      target: { row: target.row, column: target.column },
    };
    this.refCommands.push(payload);
    console.log('onSwap', { source, target, payload });
  }

  doSwap(source: Tile, target: Tile) {
    console.log('doSwap', { source, target });
    const sourceTile = this.board.getAt(source);
    const targetTile = this.board.getAt(target);
    const options = { fallingAnimatin: false };
    const shifts = [
      sourceTile.shift(target, options),
      targetTile.shift(source, options),
    ];
    this.state.setBusy(true);
    return forkJoin(shifts).pipe(
      finalize(() => {
        this.state.setBusy(false);
      })
    );
  }
}
