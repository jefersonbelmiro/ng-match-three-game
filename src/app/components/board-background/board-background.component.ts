import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  ViewChild,
} from '@angular/core';

@Component({
  selector: 'app-board-background',
  templateUrl: './board-background.component.html',
  styleUrls: ['./board-background.component.scss'],
  host: {
    '[style.width.px]': 'width',
    '[style.height.px]': 'height',
  },
})
export class BoardBackgroundComponent implements AfterViewInit {
  @Input() width: number;
  @Input() height: number;
  @Input() rows: number;
  @Input() columns: number;

  @ViewChild('canvas', { static: true }) canvasRef: ElementRef;

  constructor() {}

  ngAfterViewInit(): void {
    const element = this.canvasRef.nativeElement as HTMLCanvasElement;
    const context = element.getContext('2d');

    const width = this.width / this.columns;
    const height = this.height / this.rows;

    for (let row = 0; row < this.rows; row++) {
      for (let column = 0; column < this.columns; column++) {
        context.fillStyle = (row + column) % 2 == 0 ? '#191919' : '#111';
        context.fillRect(column * width, row * height, width, height);

        context.beginPath();
        context.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        context.strokeRect(column * width, row * height, width, height);
        context.closePath();
      }
    }
  }
}
