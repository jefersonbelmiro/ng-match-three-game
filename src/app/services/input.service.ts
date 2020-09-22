import { Injectable } from '@angular/core';
import { BoardService } from './board.service';
import { Tile, Store, getTileSize } from '../shared';
import { StateService } from './state.service';

interface State {
  element?: HTMLElement;
  pointer?: { x: number; y: number };
}

@Injectable({
  providedIn: 'root',
})
export class InputService extends Store<State> {
  constructor(private board: BoardService, private globalState: StateService) {
    super({});
  }

  setElement(element: HTMLElement) {
    this.set({ element });
  }

  onDown(event: MouseEvent) {
    if (this.globalState.isBusy()) {
      return;
    }

    const source = this.globalState.getValue().selected;
    const pointer = this.getPointer(event);
    const rect = this.getValue().element.getBoundingClientRect();
    const { width, height } = getTileSize(this.board);
    const column = Math.floor((pointer.x - rect.left) / width);
    const row = Math.floor((pointer.y - rect.top) / height);
    const target = this.board.getAt({ row, column });

    if (!target || !target.idle) {
      return;
    }

    this.set({ pointer });
    this.globalState.set({ selected: target });

    if (this.board.isAdjacent(source, target)) {
      this.globalState.set({ selected: null });
      return { source, target };
    }

    return { source: null, target };
  }

  onMove(event: MouseEvent) {
    const { pointer } = this.getValue();
    const source = this.globalState.getValue().selected;
    if (!pointer || !source || this.globalState.isBusy()) {
      return;
    }

    const current = this.getPointer(event);
    const distX = current.x - pointer.x;
    const distY = current.y - pointer.y;
    const min = Math.min(
      this.board.width / this.board.columns / 2,
      this.board.height / this.board.rows / 2
    );

    if (Math.abs(distX) <= min && Math.abs(distY) <= min) {
      return;
    }

    let { row, column } = source;
    if (Math.abs(distX) > Math.abs(distY)) {
      column = distX > 0 ? column + 1 : column - 1;
    } else {
      row = distY > 0 ? row + 1 : row - 1;
    }

    const target = this.board.getAt({ row, column });

    this.set({ pointer: null });
    this.globalState.set({ selected: null });

    if (!target || !target.idle) {
      return;
    }
    return { source, target };
  }

  onUp() {
    this.set({ pointer: null });
  }

  private getPointer(event: MouseEvent) {
    if (window.TouchEvent && event instanceof TouchEvent) {
      return {
        x: event.touches[0].pageX,
        y: event.touches[0].pageY,
      };
    }
    return {
      x: event.clientX,
      y: event.clientY,
    };
  }
}
