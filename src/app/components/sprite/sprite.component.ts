import { Component, ElementRef, Input, HostBinding } from '@angular/core';
import { Sprite } from '../../shared/sprite';
import { AnimationMetadata, AnimationBuilder } from '@angular/animations';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-sprite',
  templateUrl: './sprite.component.html',
  styleUrls: ['./sprite.component.scss'],
})
export class SpriteComponent implements Sprite {
  @HostBinding('style.left.px') @Input() x: number;
  @HostBinding('style.top.px') @Input() y: number;
  @HostBinding('style.width.px') @Input() width: number;
  @HostBinding('style.height.px') @Input() height: number;
  @Input() visible: boolean;
  @HostBinding('[hidden]') get isHidden() {
    return !this.visible;
  }

  get element(): HTMLElement {
    return this.elementRef.nativeElement;
  }

  constructor(
    protected elementRef: ElementRef,
    protected builder: AnimationBuilder
  ) {}

  animate(
    animation: AnimationMetadata | AnimationMetadata[]
  ): Observable<void> {
    return new Observable((subscribe) => {
      const factory = this.builder.build(animation);
      const player = factory.create(this.elementRef.nativeElement);
      player.onDone(() => {
        subscribe.next();
        subscribe.complete();
        player.destroy();
      });
      player.play();
    });
  }
}
