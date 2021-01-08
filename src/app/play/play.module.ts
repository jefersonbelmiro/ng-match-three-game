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
import { LevelComponent } from '../containers/level/level.component';
import { MainComponent } from '../containers/main/main.component';
import { LevelIntroComponent } from '../components/level-intro/level-intro.component';
import { LevelEndComponent } from '../components/level-end/level-end.component';

import { AngularFireModule } from '@angular/fire';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { environment } from '../../environments/environment';
import { LobbyComponent } from '../containers/lobby/lobby.component';

const firebaseConfig = {
  apiKey: environment.FIREBASE_API_KEY,
  authDomain: environment.FIREBASE_AUTH_DOMAIN,
  databaseURL: environment.FIREBASE_DATABASE_URL,
  projectId: environment.FIREBASE_PROJECT_ID,
  storageBucket: environment.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: environment.FIREBASE_MESSAGING_SENDER_ID,
  appId: environment.FIREBASE_APP_ID,
  measurementId: environment.FIREBASE_MEASUREMENT_ID,
};

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
    LevelComponent,
    MainComponent,
    LevelIntroComponent,
    LevelEndComponent,
    LobbyComponent,
  ],
  imports: [
    CommonModule,
    PlayRoutingModule,
    FontAwesomeModule,
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireAuthModule,
    AngularFirestoreModule,
  ],
})
export class PlayModule {}
