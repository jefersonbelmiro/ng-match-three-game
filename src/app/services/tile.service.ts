import {
  ComponentFactoryResolver,
  Injectable,
  ViewContainerRef,
} from '@angular/core';
import { TileComponent } from '../components/tile/tile.component';
import { Board, Colors, Tile, Position } from '../shared';

const colors = Object.keys(Colors);

@Injectable({
  providedIn: 'root',
})
export class TileService {
  constructor(private resolver: ComponentFactoryResolver) {}

  buildData(position: Position, board: Board) {
    const width = board.width / board.columns;
    const height = board.height / board.rows;
    const type = colors[Math.floor(Math.random() * colors.length)];
    return { ...position, width, height, type } as Tile;
  }

  buildComponent(data: Tile, container: ViewContainerRef) {
    const factory = this.resolver.resolveComponentFactory(TileComponent);
    const ref = container.createComponent(factory);
    Object.assign(ref.instance, data);
    ref.hostView.detectChanges();
    return ref;
  }

  buildUpdateFactory() {
    return (board: Board) => {
      return (data: Partial<Tile>) => {
        const width = board.width / board.columns;
        const height = board.height / board.rows;
        return { ...data, width, height } as Tile;
      };
    }
  }

  buildCreateFactory(container: ViewContainerRef) {
    return (board: Board) => {
      return (position: Position) => {
        const data = this.buildData(position, board);
        return this.buildComponent(data, container);
      };
    }
  }
}
