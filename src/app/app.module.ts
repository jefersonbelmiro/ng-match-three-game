import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import { BoardBackgroundComponent } from './components/board-background/board-background.component';
import { BoardComponent } from './components/board/board.component';
import { TileComponent } from './components/tile/tile.component';
import { PlayComponent } from './containers/play/play.component';
import { LevelStatusComponent } from './components/level-status/level-status.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { PowerUpsComponent } from './components/power-ups/power-ups.component';

@NgModule({
  declarations: [
    AppComponent,
    BoardComponent,
    TileComponent,
    PlayComponent,
    BoardBackgroundComponent,
    LevelStatusComponent,
    PowerUpsComponent,
  ],
  imports: [BrowserModule, BrowserAnimationsModule, FontAwesomeModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
