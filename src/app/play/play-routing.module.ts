import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PlayComponent } from '../containers/play/play.component';
import { MenuComponent } from '../containers/menu/menu.component';

const routes: Routes = [
  {
    path: '',
    component: MenuComponent,
  },
  {
    path: 'play',
    component: PlayComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PlayRoutingModule {}
