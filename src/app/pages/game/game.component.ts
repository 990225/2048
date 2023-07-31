import {
  trigger,
  state,
  style,
  transition,
  animate,
  keyframes,
  AnimationEvent,
} from '@angular/animations';
import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css'],
  animations: [
    trigger('scoreChangeAnimation', [
      state(
        'scoreAnimation',
        style({
          opacity: 0,
          transform: 'translate(-50%, calc(-50% - 2.8125rem))',
        })
      ),
      transition(':enter', [
        animate(
          '500ms ease-out',
          keyframes([
            style({ opacity: 1, transform: 'translate(-50%, -50%)' }),
            style({
              opacity: 0,
              transform: 'translate(-50%, calc(-50% - 2.8125rem))',
            }),
          ])
        ),
      ]),
    ]),
  ],
})
export class GameComponent {
  score = 0;
  bestScore = 0;
  tiles: Array<number | null> = new Array(16).fill(null);

  scoreIncrements: Array<number> = [];

  isGameOver = false;
  isGameWon = false;

  constructor() {
    this.newGame();
  }

  // 새 게임
  newGame() {
    this.score = 0;
    this.bestScore = Number(localStorage.getItem('bestScore')) || 0;
    this.tiles = new Array(16).fill(null);

    this.isGameOver = false;
    this.isGameWon = false;

    const newTiles = [this.getRandomNumber(15), this.getRandomNumber(15)];
    while (newTiles[0] === newTiles[1]) {
      newTiles[1] = this.getRandomNumber(15);
    }
    this.tiles[newTiles[0]] = this.getRandomTileValue();
    this.tiles[newTiles[1]] = this.getRandomTileValue();
  }

  // 타일 생성
  createTile() {
    const emptyTiles = this.tiles
      .map((value, index) => (value ? -1 : index))
      .filter((value) => value > -1);
    if (emptyTiles.length > 0) {
      const newTileIndex =
        emptyTiles[this.getRandomNumber(emptyTiles.length - 1)];
      this.tiles[newTileIndex] = this.getRandomTileValue();
    }
  }

  // 타일 이동
  @HostListener('window:keydown', ['$event'])
  moveTiles({ key }: KeyboardEvent) {
    if (!this.isGameOver && !this.isGameWon) {
      switch (key) {
        case 'ArrowUp':
          if (this.moveTilesUp()) {
            this.createTile();
          } else {
            this.checkGameOver();
          }
          break;
        case 'ArrowDown':
          if (this.moveTilesDown()) {
            this.createTile();
          } else {
            this.checkGameOver();
          }
          break;
        case 'ArrowLeft':
          if (this.moveTilesLeft()) {
            this.createTile();
          } else {
            this.checkGameOver();
          }
          break;
        case 'ArrowRight':
          if (this.moveTilesRight()) {
            this.createTile();
          } else {
            this.checkGameOver();
          }
          break;
        default:
          break;
      }
    }
  }

  // 위쪽으로 타일 이동
  moveTilesUp() {
    const prevScore = this.score;
    const mergedTileIndices: Array<number> = [];
    let moveCount = 0;
    for (let i = 4; i < 16; i++) {
      if (this.tiles[i]) {
        for (let j = i - 4; 0 <= j; j -= 4) {
          if (!this.tiles[j]) {
            this.tiles[j] = this.tiles[j + 4];
            this.tiles[j + 4] = null;
            moveCount++;
          } else if (
            0 > mergedTileIndices.indexOf(j) &&
            this.tiles[j] === this.tiles[j + 4]
          ) {
            this.tiles[j]! *= 2;
            this.tiles[j + 4] = null;
            this.incrementScore(this.tiles[j]!);
            mergedTileIndices.push(j);
            moveCount++;
            // 두 타일의 합이 2048이 됐을 경우 게임 승리
            if (this.tiles[j] === 2048) {
              this.isGameWon = true;
            }
            break;
          } else {
            break;
          }
        }
      }
    }
    this.pushScoreChange(this.score - prevScore);
    return !!moveCount;
  }

  // 아래쪽으로 타일 이동
  moveTilesDown() {
    const prevScore = this.score;
    const mergedTileIndices: Array<number> = [];
    let moveCount = 0;
    for (let i = 11; 0 <= i; i--) {
      if (this.tiles[i]) {
        for (let j = i + 4; j <= 15; j += 4) {
          if (!this.tiles[j]) {
            this.tiles[j] = this.tiles[j - 4];
            this.tiles[j - 4] = null;
            moveCount++;
          } else if (
            0 > mergedTileIndices.indexOf(j) &&
            this.tiles[j] === this.tiles[j - 4]
          ) {
            this.tiles[j]! *= 2;
            this.tiles[j - 4] = null;
            this.incrementScore(this.tiles[j]!);
            mergedTileIndices.push(j);
            moveCount++;
            // 두 타일의 합이 2048이 됐을 경우 게임 승리
            if (this.tiles[j] === 2048) {
              this.isGameWon = true;
            }
            break;
          } else {
            break;
          }
        }
      }
    }
    this.pushScoreChange(this.score - prevScore);
    return !!moveCount;
  }

  // 왼쪽으로 타일 이동
  moveTilesLeft() {
    const prevScore = this.score;
    const mergedTileIndices: Array<number> = [];
    let moveCount = 0;
    for (let i = 1; i < 16; i++) {
      if (i % 4) {
        if (this.tiles[i]) {
          for (let j = i - 1; i - (i % 4) <= j; j--) {
            if (!this.tiles[j]) {
              this.tiles[j] = this.tiles[j + 1];
              this.tiles[j + 1] = null;
              moveCount++;
            } else if (
              0 > mergedTileIndices.indexOf(j) &&
              this.tiles[j] === this.tiles[j + 1]
            ) {
              this.tiles[j]! *= 2;
              this.tiles[j + 1] = null;
              this.incrementScore(this.tiles[j]!);
              mergedTileIndices.push(j);
              moveCount++;
              // 두 타일의 합이 2048이 됐을 경우 게임 승리
              if (this.tiles[j] === 2048) {
                this.isGameWon = true;
              }
              break;
            } else {
              break;
            }
          }
        }
      }
    }
    this.pushScoreChange(this.score - prevScore);
    return !!moveCount;
  }

  // 오른쪽으로 타일 이동
  moveTilesRight() {
    const prevScore = this.score;
    const mergedTileIndices: Array<number> = [];
    let moveCount = 0;
    for (let i = 15; 0 <= i; i--) {
      if ((i + 1) % 4) {
        if (this.tiles[i]) {
          for (let j = i + 1; j % 4; j++) {
            if (!this.tiles[j]) {
              this.tiles[j] = this.tiles[j - 1];
              this.tiles[j - 1] = null;
              moveCount++;
            } else if (
              0 > mergedTileIndices.indexOf(j) &&
              this.tiles[j] === this.tiles[j - 1]
            ) {
              this.tiles[j]! *= 2;
              this.tiles[j - 1] = null;
              this.incrementScore(this.tiles[j]!);
              mergedTileIndices.push(j);
              moveCount++;
              // 두 타일의 합이 2048이 됐을 경우 게임 승리
              if (this.tiles[j] === 2048) {
                this.isGameWon = true;
              }
              break;
            } else {
              break;
            }
          }
        }
      }
    }
    this.pushScoreChange(this.score - prevScore);
    return !!moveCount;
  }

  // 점수 증가
  incrementScore(tileValue: number) {
    this.score += tileValue;
    if (this.score > this.bestScore) {
      this.bestScore = this.score;
      localStorage.setItem('bestScore', String(this.bestScore));
    }
  }

  // 증가된 점수 추가
  pushScoreChange(score: number) {
    if (score > 0) {
      this.scoreIncrements.push(score);
    }
  }

  // 점수 증가 애니메이션 종료 시 증가된 점수 값 제거
  onScoreChangeAnimationDone({ toState }: AnimationEvent) {
    if (toState === 'scoreAnimation') {
      this.scoreIncrements.shift();
    }
  }

  // 더 이상 합칠 수 있는 타일이 없을 경우 게임 오버
  checkGameOver() {
    if (
      this.tiles.filter(Boolean).length === 16 &&
      !this.canMoveTilesUp() &&
      !this.canMoveTilesDown() &&
      !this.canMoveTilesLeft() &&
      !this.canMoveTilesRight()
    ) {
      this.isGameOver = true;
    }
  }

  // 위쪽으로 합칠 수 있는 타일이 있는지 확인
  canMoveTilesUp() {
    for (let i = 4; i < 16; i++) {
      if (this.tiles[i]) {
        for (let j = i - 4; 0 <= j; j -= 4) {
          if (!this.tiles[j] || this.tiles[j] === this.tiles[j + 4]) {
            return true;
          } else {
            break;
          }
        }
      }
    }
    return false;
  }

  // 아래쪽으로 합칠 수 있는 타일이 있는지 확인
  canMoveTilesDown() {
    for (let i = 11; 0 <= i; i--) {
      if (this.tiles[i]) {
        for (let j = i + 4; j <= 15; j += 4) {
          if (!this.tiles[j] || this.tiles[j] === this.tiles[j - 4]) {
            return true;
          } else {
            break;
          }
        }
      }
    }
    return false;
  }

  // 왼쪽으로 합칠 수 있는 타일이 있는지 확인
  canMoveTilesLeft() {
    for (let i = 1; i < 16; i++) {
      if (i % 4) {
        if (this.tiles[i]) {
          for (let j = i - 1; i - (i % 4) <= j; j--) {
            if (!this.tiles[j] || this.tiles[j] === this.tiles[j + 1]) {
              return true;
            } else {
              break;
            }
          }
        }
      }
    }
    return false;
  }

  // 오른쪽으로 합칠 수 있는 타일이 있는지 확인
  canMoveTilesRight() {
    for (let i = 15; 0 <= i; i--) {
      if ((i + 1) % 4) {
        if (this.tiles[i]) {
          for (let j = i + 1; j % 4; j++) {
            if (!this.tiles[j] || this.tiles[j] === this.tiles[j - 1]) {
              return true;
            } else {
              break;
            }
          }
        }
      }
    }
    return false;
  }

  // 0 ~ max 랜덤한 숫자 리턴
  getRandomNumber(max: number) {
    return Math.floor(Math.random() * (max + 1));
  }

  // 2 or 4 리턴
  getRandomTileValue() {
    return Math.random() <= 0.9 ? 2 : 4;
  }
}
