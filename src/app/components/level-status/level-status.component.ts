import { Component, OnInit } from '@angular/core';
import { Colors } from '../../shared';

@Component({
  selector: 'app-level-status',
  templateUrl: './level-status.component.html',
  styleUrls: ['./level-status.component.scss']
})
export class LevelStatusComponent implements OnInit {

  data = [];

  constructor() { }

  ngOnInit(): void {

    this.data = [
      { type: Colors.Blue, remain: 66, },
      { type: Colors.Red, remain: 1, },
      { type: Colors.Pink, remain: 15, },
    ]
  }


}
