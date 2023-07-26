import { Component } from '@angular/core';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css'],
})
export class GameComponent {
  score = 0;
  tiles: Array<number> = new Array(16).fill(null);

  constructor() {}
}
