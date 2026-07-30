import { CharacterDefinitions } from "./CharacterDefinitions.js";
import { ShotDefinitions } from "./ShotDefinitions.js";

export class GameSession {
  constructor({
    characterId = "standard",
    shotId = "straight",
    highScore = Number(localStorage.getItem("cssc.highScore") ?? 0),
  } = {}) {
    this.characterId = characterId;
    this.shotId = shotId;
    this.highScore = highScore;
    this.score = 0;
    this.graze = 0;
    this.elapsedSeconds = 0;
  }

  get character() {
    return CharacterDefinitions[this.characterId] ?? CharacterDefinitions.standard;
  }

  get shot() {
    return ShotDefinitions[this.shotId] ?? ShotDefinitions.straight;
  }

  updateSelection({ characterId = this.characterId, shotId = this.shotId } = {}) {
    this.characterId = characterId;
    this.shotId = shotId;
  }

  resetRun() {
    this.score = 0;
    this.graze = 0;
    this.elapsedSeconds = 0;
  }

  saveHighScore() {
    if (this.score <= this.highScore) {
      return;
    }

    this.highScore = this.score;
    localStorage.setItem("cssc.highScore", String(this.highScore));
  }
}
