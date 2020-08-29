import { Injectable } from '@angular/core';
import { BoardService } from './board.service';
import { Tile } from '../shared';
import { StateService } from './state.service';

@Injectable({
  providedIn: 'root',
})
export class InputService {
  private state: {
    element?: HTMLElement;
    pointer?: { x: number; y: number };
    source?: Tile;
  };

  constructor(private board: BoardService, private globalState: StateService) {
    this.state = {};
  }

  setElement(element: HTMLElement) {
    this.state = { ...this.state, element };
  }

  onDown(event: MouseEvent) {
    if (this.globalState.isBusy()) {
      return;
    }
    let clientX = event.clientX;
    let clientY = event.clientY;
    if (event instanceof TouchEvent) {
      const touch = (event as unknown) as TouchEvent;
      clientX = touch.touches[0].pageX;
      clientY = touch.touches[0].pageY;
    }

    const rect = this.state.element.getBoundingClientRect();
    const width = this.board.width / this.board.columns;
    const height = this.board.height / this.board.rows;
    const column = Math.floor((clientX - rect.left) / width);
    const row = Math.floor((clientY - rect.top) / height);
    const source = this.board.getAt({ row, column });

    if (!source || !source.idle) {
      return;
    }

    this.state.pointer = { x: clientX, y: clientY };
    this.state.source = source;
    return source;
  }

  onMove(event: MouseEvent) {
    const { pointer, source } = this.state;
    if (!pointer || !source || this.globalState.isBusy()) {
      return;
    }

    let clientX = event.clientX;
    let clientY = event.clientY;
    if (event instanceof TouchEvent) {
      const touch = (event as unknown) as TouchEvent;
      clientX = touch.touches[0].pageX;
      clientY = touch.touches[0].pageY;
    }

    const distX = clientX - pointer.x;
    const distY = clientY - pointer.y;
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

    this.state.pointer = null;
    this.state.source = null;

    if (!target || !target.idle) {
      return;
    }
    return { source, target };
  }
}
