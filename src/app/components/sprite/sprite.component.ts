import { AnimationBuilder, AnimationMetadata } from '@angular/animations';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostBinding,
  Input,
} from '@angular/core';
import { Observable } from 'rxjs';
import { Sprite } from '../../shared/sprite';

@Component({
  selector: 'app-sprite',
  templateUrl: './sprite.component.html',
  styleUrls: ['./sprite.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpriteComponent implements Sprite {
  @HostBinding('style.left.px') @Input() x: number;
  @HostBinding('style.top.px') @Input() y: number;
  @HostBinding('style.width.px') @Input() width: number;
  @HostBinding('style.height.px') @Input() height: number;
  @Input() visible = true;
  @HostBinding('hidden') get isHidden() {
    return !this.visible;
  }

  get element(): HTMLElement {
    return this.elementRef.nativeElement;
  }

  constructor(
    protected elementRef: ElementRef,
    protected builder: AnimationBuilder
  ) {}

  onReborn() {
    this.visible = true;
  }

  onDie() {
    this.visible = false;
  }

  animate(
    animation: AnimationMetadata | AnimationMetadata[],
    options?: { destroyOnDone: boolean }
  ): Observable<void> {
    return new Observable((subscribe) => {
      const factory = this.builder.build(animation);
      const player = factory.create(this.elementRef.nativeElement);
      player.onDone(() => {
        subscribe.next();
        subscribe.complete();
        if (options?.destroyOnDone !== false) {
          player.destroy();
        }
      });
      player.play();
    });
  }
}
