import {
  ComponentFactoryResolver,
  Injectable,
  ViewContainerRef,
} from '@angular/core';
import { TileComponent } from '../components/tile/tile.component';
import { Board, Colors, Tile } from '../shared';

const colors = Object.keys(Colors);

@Injectable({
  providedIn: 'root',
})
export class TileService {
  constructor(private resolver: ComponentFactoryResolver) {}

  buildData({ row, column }, board: Board) {
    const width = board.width / board.columns;
    const height = board.height / board.rows;
    const type = colors[Math.floor(Math.random() * colors.length)];
    return { width, height, row, column, type } as Tile;
  }

  createComponent(data: Tile, container: ViewContainerRef) {
    const factory = this.resolver.resolveComponentFactory(TileComponent);
    const ref = container.createComponent(factory);
    Object.assign(ref.instance, data);
    ref.hostView.detectChanges();
    return ref;
  }
}
