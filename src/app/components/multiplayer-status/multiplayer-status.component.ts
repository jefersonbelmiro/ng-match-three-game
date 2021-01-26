import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Player } from '@shared/server';
import { from, of } from 'rxjs';
import { ServerService } from '../../services/server.service';

@Component({
  selector: 'app-multiplayer-status',
  templateUrl: './multiplayer-status.component.html',
  styleUrls: ['./multiplayer-status.component.scss'],
})
export class MultiplayerStatusComponent implements OnChanges {
  @Input() player: Player;
  @Input() opponent: Player;
  @Input() turnId: string;

  playerLifeCurrent: number;
  playerLifeTimer: number;
  opponentLifeCurrent: number;
  opponentLifeTimer: number;

  constructor(private server: ServerService) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes?.player && this.player && !this.player.displayName) {
      console.log('player displayName');
      this.getDisplayName(this.player.id, 'player').subscribe((displayName) => {
        this.player.displayName = displayName;
      });
    }
    if (changes?.opponent && this.opponent && !this.opponent.displayName) {
      console.log('opponent displayName');
      this.getDisplayName(this.opponent.id, 'opponent').subscribe(
        (displayName) => {
          this.opponent.displayName = displayName;
        }
      );
    }
  }

  private getDisplayName(id: string, defaultValue = null) {
    if (!id) {
      return of(defaultValue);
    }
    return from(
      this.server
        .ref(`/players/${id}/displayName`)
        .once('value')
        .then((snapshot) => {
          return snapshot.val() || defaultValue;
        })
    );
  }
}
