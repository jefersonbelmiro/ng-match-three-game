import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { InputService } from '../../services/input.service';
import { Board } from '../../shared';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
  host: {
    '[style.width.px]': 'width',
    '[style.height.px]': 'height',
  },
})
export class BoardComponent implements Board, OnInit {
  @Input() width: number;
  @Input() height: number;
  @Input() rows: number;
  @Input() columns: number;

  @Output() select = new EventEmitter();
  @Output() swap = new EventEmitter();

  constructor(private elementRef: ElementRef, private input: InputService) {}

  ngOnInit(): void {
    this.input.setElement(this.elementRef.nativeElement);
  }

  @HostListener('mousedown', ['$event'])
  @HostListener('touchstart', ['$event'])
  onInputDown(event: MouseEvent) {
    const source = this.input.onDown(event);
    if (source) {
      this.select.emit(source);
    }
  }

  @HostListener('mousemove', ['$event'])
  @HostListener('touchmove', ['$event'])
  onMouseMove(event: MouseEvent) {
    const target = this.input.onMove(event);
    if (target) {
      this.swap.emit(target);
    }
  }
}
