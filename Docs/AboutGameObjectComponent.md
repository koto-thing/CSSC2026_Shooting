# GameObject - Componentシステムについて

## これは何のための仕組み？

ゲームには、いろいろな「もの」が登場する。

- プレイヤー
- 敵
- 弾
- アイテム
- 背景
- ボタン

これらをプログラムではまとめて`GameObject`と呼ぶ。

`GameObject`は「ゲームの中に存在するもの」を表す箱のようなもの。
ただし、箱だけでは何もできない。

そこで、その箱に`Component`という部品をつけていく。

たとえば、プレイヤーを作りたいなら次のように考える。

- 位置を持つ部品
- キーボードで動く部品
- 画像を表示する部品
- 当たり判定をする部品
- 体力を持つ部品

このように、機能を小さな部品に分けて組み合わせる考え方が
`GameObject - Component`システム。

## 身近な例で考える

`GameObject`はスマートフォン本体、`Component`はアプリのようなものだと考えると分かりやすい。

スマートフォン本体だけでは、写真を撮ったり、音楽を聴いたり、地図を見たりはできない。
でも、カメラアプリ、音楽アプリ、地図アプリを入れると、できることが増える。

ゲームでも同じ。

`GameObject`という本体に、動く部品、表示する部品、攻撃する部品などをつけることで、
その物体のふるまいを作っていく。

## GameObjectとは

このプロジェクトでは、`GameObject`は次のような情報を持っている。

- `name`: オブジェクトの名前
- `active`: 動いているかどうか
- `destroyed`: すでに消されたかどうか
- `view`: 画面に表示されるもの
- `components`: つけられているComponentの一覧
- `transform`: 位置や回転などを扱うComponent

`GameObject`を作ると、最初から`Transform`というComponentが追加される。

`Transform`は、ゲームオブジェクトの位置や大きさを扱うための部品。
つまり、ほとんどすべてのゲームオブジェクトが必要とする基本部品。

## Componentとは

`Component`は、`GameObject`につける機能の部品。

このプロジェクトの`Component`には、次のような関数が用意されている。

- `initialize()`: GameObjectに追加されたときに呼ばれる
- `start()`: 最初の更新の直前に1回だけ呼ばれる
- `tick(deltaTime)`: 毎フレーム呼ばれる
- `lateTick(deltaTime)`: `tick`の後に毎フレーム呼ばれる
- `onDestroy()`: 消されるときに呼ばれる

最初は全部を覚えなくていい。
まずは、毎フレーム動かしたい処理を書く場所が`tick()`だと覚えるとよい。

## 毎フレームとは

ゲーム画面は、止まっている絵ではなく、ものすごい速さで何度も描き直されている。
この1回分の更新を「フレーム」と呼ぶ。

`tick(deltaTime)`は、ゲームが1フレーム進むたびに呼ばれる。

`deltaTime`には「前のフレームから何秒たったか」が入る。

たとえば、次のように書くと、右方向に少しずつ移動する。

```js
tick(deltaTime) {
    this.transform.x += 200 * deltaTime;
}
```

`200`は「1秒で200ピクセル進む」という意味。
`deltaTime`を使うことで、パソコンの速さが少し違っても、だいたい同じ速度で動くようになる。

## Componentを作る例

右に進み続けるComponentを作ると、次のようになる。

```js
import { Component } from "../engine/index.js";

export class MoveRightComponent extends Component {
  constructor() {
    super();
    this.speed = 200;
  }

  tick(deltaTime) {
    this.transform.x += this.speed * deltaTime;
  }
}
```

ポイントは3つ。

- `Component`を`extends`して、自分用のComponentを作る
- `constructor()`の中で`super()`を呼ぶ
- 毎フレームしたいことを`tick()`に書く

## GameObjectにComponentをつける

作ったComponentは、`addComponent()`でGameObjectにつける。

```js
import { GameObject } from "../engine/index.js";
import { MoveRightComponent } from "./MoveRightComponent.js";

const player = new GameObject("player");
player.addComponent(new MoveRightComponent());
```

これで、`player`は右に進む機能を持つようになる。

`GameObject`そのものに移動のコードを書かなくても、Componentをつけるだけで機能を足せる。

## なぜわざわざ分けるの？

すべての処理を`Player`クラスに直接書くこともできる。
小さいゲームなら、それでも動く。

でも、ゲームが大きくなると困る。

たとえば、プレイヤーにも敵にも弾にも「右に進む」動きが必要になったとする。
それぞれのクラスに同じコードを書くと、あとから直すのが大変になる。

Componentにしておけば、同じ部品をいろいろなGameObjectに使い回せる。

```js
player.addComponent(new MoveRightComponent());
enemy.addComponent(new MoveRightComponent());
bullet.addComponent(new MoveRightComponent());
```

部品を組み合わせて作れるので、プログラムが整理しやすくなる。

## このプロジェクトで使える主な操作

### Componentを追加する

```js
gameObject.addComponent(component);
```

GameObjectに新しいComponentをつける。

### Componentを取得する

```js
const move = gameObject.getComponent(MoveRightComponent);
```

指定した種類のComponentを1つ取り出す。
見つからなかった場合は`null`になる。

### Componentを持っているか調べる

```js
if (gameObject.hasComponent(MoveRightComponent)) {
  console.log("MoveRightComponentを持っています");
}
```

### Componentを外す

```js
gameObject.removeComponent(MoveRightComponent);
```

指定したComponentをGameObjectから外す。

ただし、`Transform`はGameObjectの基本部品なので外せない。

### GameObjectを止める

```js
gameObject.setActive(false);
```

`active`を`false`にすると、そのGameObjectは更新されなくなる。
画面上でも見えなくなる。

もう一度動かしたいときは、次のようにする。

```js
gameObject.setActive(true);
```

### GameObjectを消す

```js
gameObject.destroy();
```

GameObjectを完全に消す。
消されたGameObjectには、新しいComponentを追加できない。

## 処理が呼ばれる順番

GameObjectが動いている間、Componentの関数はだいたい次の順番で呼ばれる。

1. `addComponent()`でComponentを追加する
2. `initialize()`が呼ばれる
3. 最初のフレームで`start()`が1回だけ呼ばれる
4. 毎フレーム`tick(deltaTime)`が呼ばれる
5. 毎フレーム`lateTick(deltaTime)`が呼ばれる
6. 消されるときに`onDestroy()`が呼ばれる

よく使うのは`start()`と`tick()`。

- `start()`: 最初に1回だけ準備したいこと
- `tick()`: 毎フレームくり返したいこと

## まず覚えること

最初は、次の3つだけ分かれば十分。

- `GameObject`はゲーム内の「もの」
- `Component`はGameObjectにつける「機能の部品」
- 動き続ける処理は`tick(deltaTime)`に書く

慣れてきたら、`getComponent()`で他の部品を探したり、`setActive()`で一時停止したり、
`destroy()`で消したりする使い方を覚えていくとよい。
