import { Injectable } from '@angular/core';
import { TileComponent } from '../components/tile/tile.component';
import { Board, getTileSize, Position, Tile, TileState } from '../shared';
import { SpriteService } from './sprite.service';

@Injectable({
  providedIn: 'root',
})
export class TileService {
  constructor(private sprite: SpriteService) {}

  createFactory() {
    return (board: Board, position: Position, type: string) => {
      const data = {
        ...position,
        ...getTileSize(board),
        type,
        state: TileState.Idle,
      } as Tile;
      const ref = this.sprite.create(TileComponent);
      this.sprite.update(ref, data);
      return ref;
    };
  }

  updateFactory() {
    return (tile: Tile, data: Tile) => {
      const ref = this.sprite.get(tile);
      this.sprite.update(ref, data);
    };
  }

  destroyFactory() {
    return (data: Tile) => {
      return this.sprite.destroy(data);
    };
  }
}
