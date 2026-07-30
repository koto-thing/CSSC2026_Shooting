import "./style.css";

import { AssetManager, Game, SceneManager } from "./engine/index.js";
import { GameSession } from "./config/GameSession.js";
import { assetList } from "./assets/AssetsList.js";
import { CreditsScene } from "./scenes/CreditsScene.js";
import { GameScene } from "./scenes/GameScene.js";
import { MainMenuScene } from "./scenes/MainMenuScene.js";
import { TitleScene } from "./scenes/TitleScene.js";

async function main() {
  const game = new Game("gameCanvas");

  const assetManager = new AssetManager();
  assetManager.register(assetList);
  await assetManager.load();

  const session = new GameSession();
  const sceneManager = new SceneManager(game.stage);
  game.onResize(({ width, height }) => {
    sceneManager.resize(width, height);
  });

  sceneManager.register("title", () => new TitleScene({ sceneManager, assetManager }));
  sceneManager.register("credits", () => new CreditsScene({ sceneManager }));
  sceneManager.register("menu", () => new MainMenuScene({ sceneManager, session }));
  sceneManager.register("game", () => new GameScene({ sceneManager, assetManager, session }));

  sceneManager.changeScene("title");

  game.start((deltaTime) => {
    sceneManager.tick(deltaTime);
  });
}

main().catch((error) => {
  console.error("Error while initializing game", error);
});
