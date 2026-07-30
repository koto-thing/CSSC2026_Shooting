import { Bullet } from "./Bullet.js";

/** 設定済みの弾オブジェクトを生成するファクトリー */
export class BulletFactory {
  /** 弾ファクトリーを初期化する */
  constructor({ boundsProvider } = {}) {
    this.boundsProvider = boundsProvider;
  }

  /**
   * 弾を生成する
   * @returns {Bullet} 生成された弾のインスタンス
   */
  createBullet() {
    return new Bullet({ boundsProvider: this.boundsProvider });
  }
}
