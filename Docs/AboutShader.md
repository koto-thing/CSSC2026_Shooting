# Shaderの書き方について

## Shaderとは

Shaderは、画面に出す絵の色を決めるための小さなプログラム。

普通のJavaScriptでは、次のように「円を描く」「四角を描く」と命令する。

```js
view.graphics.beginFill("#44aaff").drawCircle(0, 0, 12);
```

Shaderでは、少し考え方が変わる。

「このピクセルは何色にする？」という処理を、ものすごい数のピクセルに対して同時に行う。

たとえば、プレイヤーの円が24 x 24ピクセルなら、最大で576個のピクセルがある。
Shaderは、その1つ1つに対して色を決める。

## 身近な例で考える

Shaderは、画像編集アプリのフィルターに近い。

- 明るくする
- 暗くする
- 赤っぽくする
- ぼかす
- 光っているように見せる
- 2Dの円を球のように見せる

これらをプログラムで書くのがShader。

このプロジェクトでは、CreateJSの`StageGL`と`Filter`を使ってShaderを動かす。

## StageGLで気をつけること

CreateJSには大きく分けて2種類のStageがある。

- `createjs.Stage`: 普通のCanvas2D描画
- `createjs.StageGL`: WebGLを使った描画

Shaderを使いたい場合は`StageGL`を使う。

ただし、`StageGL`は`Shape`や`Text`をそのまま描くのが苦手。
そのため、`Shape`や`Text`は`cache()`して画像のようにしてから表示する。

```js
view.cache(-12, -12, 24, 24);
```

このコードは、「`view`のこの範囲を画像として保存しておく」という意味。

Shaderをかける場合も、基本的には`cache()`が必要。

## このプロジェクトでのShaderの置き場所

Shaderのコードは、次のファイルに置いている。

```txt
src/effects/SphereShaderFilter.js
```

中身はこのような形になっている。

```js
export class SphereShaderFilter extends createjs.Filter {
  constructor() {
    super();

    this.FRAG_SHADER_BODY = `
            void main() {
                vec2 uv = vRenderCoord;
                vec4 color = texture2D(uSampler, vRenderCoord);

                gl_FragColor = color;
            }
        `;
  }
}
```

`SphereShaderFilter`は、CreateJSの`Filter`を継承して作った自分用のフィルター。

Shaderの本体は、`FRAG_SHADER_BODY`の中に書く。

## GLSLという言語

Shaderの中はJavaScriptではなく、GLSLという別の言語で書く。

似ているところもあるが、いくつかルールが違う。

```glsl
float x = 1.0;
vec2 position = vec2(0.5, 0.5);
vec3 color = vec3(1.0, 0.0, 0.0);
vec4 pixel = vec4(1.0, 0.0, 0.0, 1.0);
```

よく使う型は次の通り。

- `float`: 小数。例: `0.5`
- `vec2`: 数字2つのセット。例: `x, y`
- `vec3`: 数字3つのセット。例: `r, g, b`
- `vec4`: 数字4つのセット。例: `r, g, b, a`

色はだいたい`vec4`で扱う。

```glsl
vec4 color = vec4(1.0, 0.0, 0.0, 1.0);
```

これは赤色。

- 1つ目: 赤
- 2つ目: 緑
- 3つ目: 青
- 4つ目: 透明度

色の値は`0.0`から`1.0`で表す。

## 最小のShader

まずは、元の画像をそのまま表示するShader。

```glsl
void main() {
    vec4 color = texture2D(uSampler, vRenderCoord);
    gl_FragColor = color;
}
```

`texture2D(uSampler, vRenderCoord)`は、「元の画像から今の場所の色を取ってくる」という意味。

`gl_FragColor`に入れた色が、最終的に画面に出る。

つまり、Shaderの基本はこう。

```glsl
void main() {
    色を計算する;
    gl_FragColor = 最後に出したい色;
}
```

## 色を変えてみる

元の色を赤っぽくする。

```glsl
void main() {
    vec4 color = texture2D(uSampler, vRenderCoord);

    color.r *= 1.5;

    gl_FragColor = color;
}
```

`color.r`は赤成分。

同じように、緑と青も触れる。

```glsl
color.g *= 0.5;
color.b *= 2.0;
```

## 暗くしてみる

全体を暗くする。

```glsl
void main() {
    vec4 color = texture2D(uSampler, vRenderCoord);

    color.rgb *= 0.5;

    gl_FragColor = color;
}
```

`color.rgb`は、赤・緑・青をまとめて扱う書き方。

`0.5`をかけると半分の明るさになる。

## 画面上の位置を使う

`vRenderCoord`には、今処理している場所が入っている。

左上がだいたい`(0.0, 0.0)`、右下がだいたい`(1.0, 1.0)`。

```glsl
vec2 uv = vRenderCoord;
```

`uv.x`は横方向。
`uv.y`は縦方向。

たとえば、右に行くほど赤くする。

```glsl
void main() {
    vec2 uv = vRenderCoord;
    vec4 color = texture2D(uSampler, uv);

    color.r = uv.x;

    gl_FragColor = color;
}
```

## 円の中心からの距離を使う

球っぽい見た目を作るには、中心からの距離を使うと分かりやすい。

まず、`uv`は`0.0`から`1.0`の範囲。

```glsl
vec2 uv = vRenderCoord;
```

これを、中心が`0.0`になるように変換する。

```glsl
vec2 p = uv * 2.0 - 1.0;
```

すると、だいたい次のようになる。

- 左上: `(-1.0, -1.0)`
- 中心: `(0.0, 0.0)`
- 右下: `(1.0, 1.0)`

中心からの距離は`length()`で計算できる。

```glsl
float r = length(p);
```

中心は`0.0`、外側に行くほど`1.0`に近づく。

## 円を球っぽくする

外側ほど暗くすると、少し球っぽく見える。

```glsl
void main() {
    vec2 uv = vRenderCoord;
    vec4 color = texture2D(uSampler, uv);

    vec2 p = uv * 2.0 - 1.0;
    float r = length(p);

    if (r > 1.0) {
        discard;
    }

    float light = 1.0 - r * 0.7;
    color.rgb *= light;

    gl_FragColor = color;
}
```

`discard`は「このピクセルは描かない」という意味。

`r > 1.0`の場所は円の外側なので、消している。

## 光の向きを作る

もう少し球っぽくするには、「どこから光が当たっているか」を考える。

```glsl
vec3 lightDir = normalize(vec3(-0.45, -0.6, 1.0));
vec3 normal = normalize(vec3(p, sqrt(1.0 - r * r)));
float diffuse = max(dot(normal, lightDir), 0.0);
```

ここは少し難しいので、最初は丸暗記でもよい。

ざっくり言うと、次のことをしている。

- `normal`: 球の表面がどちらを向いているか
- `lightDir`: 光がどちらから来ているか
- `dot()`: 向きがどれくらい近いか
- `diffuse`: 光の当たり具合

完成形は次のようになる。

```glsl
void main() {
    vec2 uv = vRenderCoord;
    vec4 color = texture2D(uSampler, uv);

    vec2 p = uv * 2.0 - 1.0;
    float r = length(p);

    if (r > 1.0) {
        discard;
    }

    vec3 lightDir = normalize(vec3(-0.45, -0.6, 1.0));
    vec3 normal = normalize(vec3(p, sqrt(1.0 - r * r)));
    float diffuse = max(dot(normal, lightDir), 0.0);
    float rim = pow(1.0 - normal.z, 2.0) * 0.35;

    color.rgb *= 0.35 + diffuse * 0.8 + rim;

    gl_FragColor = vec4(color.rgb, color.a);
}
```

## JavaScript側でShaderを使う

作ったShaderは、表示オブジェクトの`filters`に入れる。

```js
import { SphereShaderFilter } from "../effects/SphereShaderFilter.js";

const view = new createjs.Shape();

view.graphics.beginFill("#44aaff").drawCircle(0, 0, 12);

view.filters = [new SphereShaderFilter()];
view.cache(-12, -12, 24, 24);
```

このプロジェクトでは、プレイヤーにこのShaderを使っている。

```txt
src/player/Player.js
```

## 数字を変えて試す

Shaderは、数字を少し変えるだけで見た目が変わる。

最初は次の数字を変えて試すとよい。

```glsl
vec3 lightDir = normalize(vec3(-0.45, -0.6, 1.0));
```

光の向きが変わる。

```glsl
float rim = pow(1.0 - normal.z, 2.0) * 0.35;
```

ふちの光り方が変わる。

```glsl
color.rgb *= 0.35 + diffuse * 0.8 + rim;
```

全体の明るさが変わる。

## よくあるエラー

### 画面が灰色になる

Shaderのコンパイルに失敗している可能性がある。

まず、ブラウザの開発者ツールでConsoleを見る。
GLSLは書き間違えると、JavaScriptとは別のエラーが出る。

### ShapeやTextが出ない

`StageGL`では、`Shape`や`Text`を`cache()`する必要がある。

```js
view.cache(-12, -12, 24, 24);
```

背景や文字も同じ。

### 画面の下に余白が出る

Canvasをリサイズした後に、StageGLのviewportも更新する。

```js
this.stage.updateViewport(width, height);
```

### `uniform`や`varying`を書いたら動かない

CreateJSの`FRAG_SHADER_BODY`には、Shaderの本文だけを書く。

このプロジェクトでは、次のように`void main()`から書けばよい。

```glsl
void main() {
    vec4 color = texture2D(uSampler, vRenderCoord);
    gl_FragColor = color;
}
```

`uniform sampler2D uSampler;`などは、CreateJS側が用意している。

## まず覚えること

最初は、次の5つだけ分かれば十分。

- Shaderは「ピクセルごとの色を決めるプログラム」
- `texture2D(uSampler, vRenderCoord)`で元の色を取る
- `gl_FragColor`に入れた色が画面に出る
- `vRenderCoord`で今の場所が分かる
- CreateJSでは`filters`に入れて、`cache()`して使う

慣れてきたら、`sin()`、`cos()`、`length()`、`dot()`、`normalize()`などの関数を使って、
光、波、ゆがみ、発光などを作っていくとよい。
