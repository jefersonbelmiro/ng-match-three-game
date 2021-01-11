import {
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
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
  ownerId: string;
  target: { row: number; column: number };
  source?: { row: number; column: number };
}

@Component({
  selector: 'app-multiplayer',
  templateUrl: './multiplayer.component.html',
  styleUrls: ['./multiplayer.component.scss'],
})
export class MultiplayerComponent implements OnInit, OnDestroy {
  @ViewChild('container', { read: ViewContainerRef, static: true })
  container: ViewContainerRef;

  boardData: Board;
  data: MultiplayerData;

  refCommands: DatabaseReference;
  refUpdateChanges: DatabaseReference;
  refTurnChanges: DatabaseReference;

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

    const data = currentState.multiplayer;
    this.data = currentState.multiplayer;
    this.refCommands = this.firebase.database.ref(
      `/commands/${data.player.uid}`
    );

    this.refTurnChanges = this.firebase.database.ref(
      `/games/${data.gameId}/turn`
    );
    this.refTurnChanges.on('value', this.onTurnChanges);

    // get `/board` data and watch `/updates`
    this.firebase.database
      .ref(`/games/${data.gameId}/board`)
      .once('value')
      .then((snapshot) => {
        try {
          this.createBoard(snapshot.val());
          this.refUpdateChanges = this.firebase.database.ref(
            `/games/${data.gameId}/updates`
          );
          this.refUpdateChanges.on('child_added', this.onUpdateChanges);
        } catch (err) {
          console.error('board err', err);
        }
      });

    // get displayName
    const playerId = data.player.uid;
    this.firebase.database
      .ref(`/players/${playerId}/displayName`)
      .once('value')
      .then((snapshot) => {
        this.data.player.displayName = snapshot.val() || 'you';
      });

    // get opponent displayName
    const opponentID = data.opponent.uid;
    this.firebase.database
      .ref(`/players/${opponentID}/displayName`)
      .once('value')
      .then((snapshot) => {
        this.data.opponent.displayName = snapshot.val() || 'opponent';
      });
  }

  ngOnDestroy() {
    if (this.refUpdateChanges) {
      this.refUpdateChanges.off('child_added', this.onUpdateChanges);
    }
    if (this.refTurnChanges) {
      this.refTurnChanges.off('value', this.onTurnChanges);
    }
  }

  onTurnChanges = (snapshot: firebase.database.DataSnapshot) => {
    const uid = snapshot.val();
    const playerTurn = uid === this.data.player.uid;
    this.data.turn = playerTurn ? 'player' : 'opponent';
    this.state.setBusy(!playerTurn, true);
    console.log('turn changes', playerTurn, {
      uid,
      playerId: this.data.player.uid,
    });
  };

  onUpdateChanges = (snapshot: firebase.database.DataSnapshot) => {
    const update: Update = snapshot.val();
    console.log('onUpdateChanges', update);
    if (!update) {
      return;
    }
    if (update.ownerId === this.data.player.uid || update.type !== 'shift') {
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
    if (this.data.turn !== 'player') {
      console.log('onSwap', this.data.turn);
      return;
    }
    const payload = {
      command: 'move',
      gameId: this.data.gameId,
      source: { row: source.row, column: source.column },
      target: { row: target.row, column: target.column },
    };
    this.refCommands.push(payload);
    this.data.turn = 'opponent';
    this.state.setBusy(true, true);
    this.doSwap(source, target).subscribe();
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
    return forkJoin(shifts);
  }
}
