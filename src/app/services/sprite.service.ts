import {
  ComponentFactoryResolver,
  ComponentRef,
  Injectable,
  Type,
  ViewContainerRef,
} from '@angular/core';
import { Sprite } from '../shared/sprite';

@Injectable({
  providedIn: 'root',
})
export class SpriteService {
  dataRef = new Map<Sprite, ComponentRef<Sprite>>();
  container: ViewContainerRef;

  constructor(private resolver: ComponentFactoryResolver) {}

  setContainer(container: ViewContainerRef) {
    this.container = container;
  }

  create<T extends Sprite>(sprite: Type<T>) {
    const ref = this.createComponent(sprite);
    this.dataRef.set(ref.instance, ref);
    return ref;
  }

  get(sprite: Sprite) {
    return this.dataRef.get(sprite);
  }

  destroy(sprite: Sprite) {
    const ref = this.dataRef.get(sprite);
    if (ref) {
      ref.destroy();
      this.dataRef.delete(sprite);
    }
  }

  createComponent<T extends Sprite>(sprite: Type<T>) {
    const factory = this.resolver.resolveComponentFactory(sprite);
    const ref = this.container.createComponent(factory);
    return ref;
  }
}
