import { Entity } from './entity';

export interface Sprite extends Entity {
  element: HTMLElement;
  visible: boolean;
}
