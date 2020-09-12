import { Injectable } from '@angular/core';
import { TileComponent } from '../components/tile/tile.component';
import { Board, Colors, Monsters, Position, Tile } from '../shared';
import { SpriteService } from './sprite.service';

const colors = Object.keys(Colors);
const monsters = Object.keys(Monsters);

@Injectable({
  providedIn: 'root',
})
export class TileService {
  constructor(private sprite: SpriteService) {}

  buildData(position: Position, board: Board) {
    const width = board.width / board.columns;
    const height = board.height / board.rows;
    // const type = colors[Math.floor(Math.random() * colors.length)];
    // const type = monsters[Math.floor(Math.random() * monsters.length)];
    const type = monsters[Math.floor(Math.random() * 4)];
    return { ...position, width, height, type } as Tile;
  }

  createFactory() {
    return (board: Board, position: Position) => {
      const data = this.buildData(position, board);
      const ref = this.sprite.create(TileComponent);
      Object.assign(ref.instance, data);
      return ref;
    };
  }

  destroyFactory() {
    return (data: Tile) => {
      return this.sprite.destroy(data);
    }
  }
}
