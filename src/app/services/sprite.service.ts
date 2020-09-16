import {
  ComponentFactoryResolver,
  ComponentRef,
  Injectable,
  Type,
  ViewContainerRef,
  ChangeDetectorRef,
} from '@angular/core';
import { Sprite } from '../shared/sprite';

@Injectable({
  providedIn: 'root',
})
export class SpriteService {
  dataRef = new Map<Sprite, ComponentRef<Sprite>>();
  pool = new Map<Type<Sprite>, ComponentRef<Sprite>[]>();
  container: ViewContainerRef;

  constructor(private resolver: ComponentFactoryResolver) {}

  setContainer(container: ViewContainerRef) {
    this.container = container;
  }

  create<T extends Sprite>(sprite: Type<T>): ComponentRef<T> {
    let ref: ComponentRef<Sprite>;
    if (!this.pool.has(sprite)) {
      this.pool.set(sprite, []);
    }
    ref = this.pool.get(sprite).shift();
    if (ref) {
      ref.changeDetectorRef.reattach();
      ref.instance.onReborn();
      ref.changeDetectorRef.markForCheck();
      Promise.resolve().then(() => this.update(ref));
    } else {
      ref = this.createComponent(sprite);
    }
    this.dataRef.set(ref.instance, ref);
    return ref as ComponentRef<T>;
  }

  update(ref: ComponentRef<Sprite>, data?: Partial<Sprite>) {
    Object.assign(ref.instance, data);
    if (ref.instance['ngOnChanges']) {
      ref.instance[`ngOnChanges`].call(ref.instance);
    }
    // when component is onPush and setting the
    // input programmatically from Angular perspective nothing has changed.
    // and host view detector ref not trigger component changes
    ref.injector.get(ChangeDetectorRef).detectChanges();
  }

  get(sprite: Sprite) {
    return this.dataRef.get(sprite);
  }

  destroy(sprite: Sprite) {
    const ref = this.dataRef.get(sprite);
    if (ref) {
      ref.instance.onDie();
      ref.changeDetectorRef.detectChanges();
      ref.changeDetectorRef.detach();
      this.pool.get(ref.componentType).push(ref);
      this.dataRef.delete(sprite);
    }
  }

  createComponent<T extends Sprite>(sprite: Type<T>) {
    const factory = this.resolver.resolveComponentFactory(sprite);
    const ref = this.container.createComponent(factory);
    return ref;
  }
}
