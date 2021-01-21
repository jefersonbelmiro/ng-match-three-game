import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { from, of } from 'rxjs';
import { ServerService } from '../../services/server.service';
import { Player } from '@shared/server';

@Component({
  selector: 'app-multiplayer-status',
  templateUrl: './multiplayer-status.component.html',
  styleUrls: ['./multiplayer-status.component.scss'],
})
export class MultiplayerStatusComponent implements OnChanges {
  @Input() player: Player;
  @Input() opponent: Player;
  @Input() turnId: string;

  constructor(private server: ServerService) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes?.player && this.player) {
      this.getDisplayName(this.player.id, 'player').subscribe((displayName) => {
        this.player.displayName = displayName;
      });
    }
    if (changes?.opponent && this.opponent) {
      this.getDisplayName(this.opponent.id, 'opponent').subscribe((displayName) => {
        this.opponent.displayName = displayName;
      });
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
