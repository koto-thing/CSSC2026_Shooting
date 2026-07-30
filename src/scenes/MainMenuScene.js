import { Button, Scene, Text } from "../engine/index.js";
import { CharacterDefinitionList } from "../config/CharacterDefinitions.js";
import { ShotDefinitionList } from "../config/ShotDefinitions.js";

function makeText(text, font = "18px sans-serif", width = 320, height = 44) {
  return new Text({
    text,
    width,
    height,
    font,
    color: "#f7f9ff",
    textAlign: "center",
    verticalAlign: "middle",
  });
}

export class MainMenuScene extends Scene {
  constructor({ sceneManager, session }) {
    super();
    this.sceneManager = sceneManager;
    this.session = session;
    this.background = new createjs.Shape();
    this.backButton = new Button({
      text: "TITLE",
      width: 130,
      height: 46,
      font: "18px sans-serif",
    });
    this.startButton = new Button({
      text: "GAME START",
      width: 220,
      height: 54,
      font: "20px sans-serif",
    });
    this.characterButtons = [];
    this.shotButtons = [];
    this.headingCharacter = makeText("CHARACTER", "24px sans-serif", 280, 48);
    this.headingShot = makeText("SHOT", "24px sans-serif", 280, 48);
    this.summary = makeText("", "18px sans-serif", 620, 96);
  }

  initialize() {
    this.backButton.onClick(() => this.sceneManager.changeScene("title"));
    this.startButton.onClick(() => {
      this.session.resetRun();
      this.sceneManager.changeScene("game");
    });

    for (const character of CharacterDefinitionList) {
      const button = new Button({
        text: character.label,
        width: 240,
        height: 52,
        font: "18px sans-serif",
      });
      button.onClick(() => {
        this.session.updateSelection({ characterId: character.id });
        this.#refreshSelections();
      });
      this.characterButtons.push({ definition: character, button });
    }

    for (const shot of ShotDefinitionList) {
      const button = new Button({
        text: shot.label,
        width: 240,
        height: 52,
        font: "18px sans-serif",
      });
      button.onClick(() => {
        this.session.updateSelection({ shotId: shot.id });
        this.#refreshSelections();
      });
      this.shotButtons.push({ definition: shot, button });
    }

    this.root.addChild(
      this.background,
      this.backButton,
      this.headingCharacter,
      this.headingShot,
      ...this.characterButtons.map((item) => item.button),
      ...this.shotButtons.map((item) => item.button),
      this.summary,
      this.startButton,
    );
    this.#refreshSelections();
    this.layout();
  }

  resize(width, height) {
    super.resize(width, height);
    this.layout();
  }

  layout() {
    this.background.graphics.clear().beginFill("#0b0d1c").drawRect(0, 0, this.width, this.height);
    this.backButton.x = 18;
    this.backButton.y = 18;
    this.startButton.x = this.width - 238;
    this.startButton.y = this.height - 72;

    const leftX = Math.max(40, this.width / 2 - 330);
    const rightX = Math.min(this.width - 280, this.width / 2 + 90);
    const topY = Math.max(94, this.height * 0.22);
    this.headingCharacter.x = leftX - 20;
    this.headingCharacter.y = topY - 62;
    this.headingShot.x = rightX - 20;
    this.headingShot.y = topY - 62;

    this.characterButtons.forEach((item, index) => {
      item.button.x = leftX;
      item.button.y = topY + index * 72;
    });
    this.shotButtons.forEach((item, index) => {
      item.button.x = rightX;
      item.button.y = topY + index * 72;
    });

    this.summary.x = this.width / 2 - 310;
    this.summary.y = Math.min(this.height - 190, topY + 250);
    this.background.cache(0, 0, this.width, this.height);
  }

  #refreshSelections() {
    for (const item of this.characterButtons) {
      const selected = item.definition.id === this.session.characterId;
      item.button.setColors({
        normal: selected ? "#65d887" : "#3c4868",
        hover: selected ? "#7df0a0" : "#53617f",
        pressed: selected ? "#4ab96a" : "#313b58",
      });
    }

    for (const item of this.shotButtons) {
      const selected = item.definition.id === this.session.shotId;
      item.button.setColors({
        normal: selected ? "#e85d8f" : "#3c4868",
        hover: selected ? "#ff79a8" : "#53617f",
        pressed: selected ? "#c84574" : "#313b58",
      });
    }

    this.summary.setText(
      `${this.session.character.label}: ${this.session.character.description}\n` +
        `${this.session.shot.label}: ${this.session.shot.description}\n` +
        "Z: Shot / Shift: Focus / Escape: Pause",
    );
  }
}
