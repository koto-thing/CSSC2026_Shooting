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
    this.chapterAttempts = 1;
    this.totalRetries = 0;
    this.clearedChapters = 0;
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
    this.chapterAttempts = 1;
    this.totalRetries = 0;
    this.clearedChapters = 0;
  }

  startChapter() {
    this.chapterAttempts = 1;
  }

  retryChapter() {
    this.chapterAttempts += 1;
    this.totalRetries += 1;
  }

  clearChapter() {
    this.clearedChapters += 1;
  }

  saveHighScore() {
    if (this.score <= this.highScore) {
      return;
    }

    this.highScore = this.score;
    localStorage.setItem("cssc.highScore", String(this.highScore));
  }
}
