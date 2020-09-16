import { Injectable } from '@angular/core';
import { EffectAxeComponent } from '../components/effect-axe/effect-axe.component';
import { EffectHorizontalArrowComponent } from '../components/effect-horizontal-arrow/effect-horizontal-arrow.component';
import { EffectVerticalArrowComponent } from '../components/effect-vertical-arrow/effect-vertical-arrow.component';
import { PowerUp, PowerUps, Tile } from '../shared';
import { BoardService } from './board.service';
import { SpriteService } from './sprite.service';
import { StateService } from './state.service';
import { of, Subject } from 'rxjs';
import { delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class PowerUpService {
  constructor(
    private board: BoardService,
    private state: StateService,
    private sprite: SpriteService
  ) {}

  execute(powerUp: PowerUp, target: Tile) {
    this.updateState(powerUp);
    switch (powerUp.type) {
      case PowerUps.HorizontalArrow:
        return this.executeUpHorizontal(target);
      case PowerUps.VerticalArrow:
        return this.executeUpVertical(target);
      case PowerUps.Star:
        return this.executeUpStar(target);
      case PowerUps.Axe:
        return this.executeUpAxe(target);
    }
  }

  updateState(powerUp: PowerUp) {
    powerUp.value -= 1;
    const current = this.state.getValue();
    const powerUps = [...current.powerUps];
    this.state.set({ powerUps });
  }

  executeUpHorizontal(target: Tile) {
    const ref = this.sprite.create(EffectHorizontalArrowComponent);
    ref.instance.type = target.type;
    ref.instance.x = 140;
    ref.instance.y = target.y;
    ref.instance.die().subscribe(() => {
      this.sprite.destroy(ref.instance);
    });

    const matches: Tile[] = [
      target,
      ...this.board.getAllRow(target.row).filter((item) => {
        return item !== target;
      }),
    ];

    return of(matches);
  }

  executeUpVertical(target: Tile) {
    const ref = this.sprite.create(EffectVerticalArrowComponent);
    ref.instance.type = target.type;
    ref.instance.x = target.x;
    ref.instance.y = 140;
    ref.instance.die().subscribe(() => {
      this.sprite.destroy(ref.instance);
    });

    const matches: Tile[] = [
      target,
      ...this.board.getAllColumn(target.column).filter((item) => {
        return item !== target;
      }),
    ];

    return of(matches);
  }

  executeUpStar(target: Tile) {
    const matches: Tile[] = [
      target,
      ...this.board.getAllType(target.type).filter((item) => {
        return item !== target;
      }),
    ];

    return of(matches);
  }

  executeUpAxe(target: Tile) {
    const result = new Subject<Tile[]>();
    const ref = this.sprite.create(EffectAxeComponent);
    ref.instance.die(target).subscribe(() => {
      result.next([target]);
      result.complete();
      this.sprite.destroy(ref.instance);
    });
    return result.asObservable();
  }
}
