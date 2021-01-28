import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AngularFireModule } from '@angular/fire';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { environment } from '../../environments/environment';
import { BoardBackgroundComponent } from '../components/board-background/board-background.component';
import { BoardComponent } from '../components/board/board.component';
import { EffectAxeComponent } from '../components/effect-axe/effect-axe.component';
import { EffectHorizontalArrowComponent } from '../components/effect-horizontal-arrow/effect-horizontal-arrow.component';
import { EffectScoreComponent } from '../components/effect-score/effect-score.component';
import { EffectVerticalArrowComponent } from '../components/effect-vertical-arrow/effect-vertical-arrow.component';
import { LevelEndComponent } from '../components/level-end/level-end.component';
import { LevelIntroComponent } from '../components/level-intro/level-intro.component';
import { LevelStatusComponent } from '../components/level-status/level-status.component';
import { PlayBackgroundComponent } from '../components/play-background/play-background.component';
import { PowerUpsComponent } from '../components/power-ups/power-ups.component';
import { SpriteComponent } from '../components/sprite/sprite.component';
import { TileComponent } from '../components/tile/tile.component';
import { LevelComponent } from '../containers/level/level.component';
import { LobbyComponent } from '../containers/lobby/lobby.component';
import { MainComponent } from '../containers/main/main.component';
import { MenuComponent } from '../containers/menu/menu.component';
import { PlayComponent } from '../containers/play/play.component';
import { PlayRoutingModule } from './play-routing.module';
import { AuthService } from '../services/auth.service';

import { USE_EMULATOR as USE_DATABASE_EMULATOR } from '@angular/fire/database';
import {
  AngularFireFunctionsModule,
  USE_EMULATOR as USE_FUNCTIONS_EMULATOR,
} from '@angular/fire/functions';
import { MultiplayerComponent } from '../containers/multiplayer/multiplayer.component';
import { MultiplayerStatusComponent } from '../components/multiplayer-status/multiplayer-status.component';
import { ServerService } from '../services/server.service';

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
    MultiplayerComponent,
    MultiplayerStatusComponent,
  ],
  imports: [
    CommonModule,
    PlayRoutingModule,
    FontAwesomeModule,
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireFunctionsModule,
    AngularFireAuthModule,
  ],
  providers: [
    AuthService,
    ServerService,
    {
      provide: USE_DATABASE_EMULATOR,
      useValue:
        !environment.production && environment.USE_EMULATORS
          ? ['localhost', 9000]
          : undefined,
    },
    {
      provide: USE_FUNCTIONS_EMULATOR,
      useValue:
        !environment.production && environment.USE_EMULATORS
          ? ['localhost', 5001]
          : undefined,
    },
  ],
})
export class PlayModule {}
