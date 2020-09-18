import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { BoardBackgroundComponent } from '../components/board-background/board-background.component';
import { BoardComponent } from '../components/board/board.component';
import { EffectScoreComponent } from '../components/effect-score/effect-score.component';
import { LevelStatusComponent } from '../components/level-status/level-status.component';
import { PowerUpsComponent } from '../components/power-ups/power-ups.component';
import { SpriteComponent } from '../components/sprite/sprite.component';
import { TileComponent } from '../components/tile/tile.component';
import { PlayComponent } from '../containers/play/play.component';
import { PlayRoutingModule } from './play-routing.module';
import { PlayBackgroundComponent } from '../components/play-background/play-background.component';
import { EffectHorizontalArrowComponent } from '../components/effect-horizontal-arrow/effect-horizontal-arrow.component';
import { EffectVerticalArrowComponent } from '../components/effect-vertical-arrow/effect-vertical-arrow.component';
import { EffectAxeComponent } from '../components/effect-axe/effect-axe.component';
import { MenuComponent } from '../containers/menu/menu.component';

@NgModule({
  declarations: [
    BoardComponent,
    TileComponent,
    PlayComponent,
    BoardBackgroundComponent,
    LevelStatusComponent,
    PowerUpsComponent,
    EffectScoreComponent,
    SpriteComponent,
    PlayBackgroundComponent,
    EffectHorizontalArrowComponent,
    EffectVerticalArrowComponent,
    EffectAxeComponent,
    MenuComponent,
  ],
  imports: [CommonModule, PlayRoutingModule, FontAwesomeModule,],
})
export class PlayModule {}
