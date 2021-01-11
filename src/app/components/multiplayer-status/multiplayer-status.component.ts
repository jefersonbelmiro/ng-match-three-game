import { Component, Input, OnInit } from '@angular/core';
import { MultiplayerData } from '../../shared';

@Component({
  selector: 'app-multiplayer-status',
  templateUrl: './multiplayer-status.component.html',
  styleUrls: ['./multiplayer-status.component.scss']
})
export class MultiplayerStatusComponent implements OnInit {

  @Input() data: MultiplayerData;

  constructor() { }

  ngOnInit(): void {
  }

}
