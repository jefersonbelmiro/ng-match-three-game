import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PlayComponent } from '../containers/play/play.component';
import { MenuComponent } from '../containers/menu/menu.component';
import { LevelComponent } from '../containers/level/level.component';
import { MainComponent } from '../containers/main/main.component';
import { LobbyComponent } from '../containers/lobby/lobby.component';
import { MultiplayerComponent } from '../containers/multiplayer/multiplayer.component';

const routes: Routes = [
  {
    path: '',
    component: MainComponent,
    children: [
      {
        path: '',
        component: MenuComponent,
      },
      {
        path: 'play',
        component: PlayComponent,
      },
      {
        path: 'level',
        component: LevelComponent,
      },
      {
        path: 'lobby',
        component: LobbyComponent,
      },
      {
        path: 'multiplayer',
        component: MultiplayerComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PlayRoutingModule {}
