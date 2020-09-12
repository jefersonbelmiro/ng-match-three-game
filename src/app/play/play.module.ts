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
  ],
  imports: [CommonModule, PlayRoutingModule, FontAwesomeModule,],
})
export class PlayModule {}
