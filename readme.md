# Shell.js

[![npm](https://img.shields.io/npm/v/ikagaka.shell.js.svg?style=flat)](https://npmjs.com/package/ikagaka.shell.js) [![bower](https://img.shields.io/bower/v/ikagaka.shell.js.svg)](http://bower.io/search/?q=ikagaka)
[![Build Status](https://travis-ci.org/Ikagaka/Shell.js.svg?branch=master)](https://travis-ci.org/Ikagaka/Shell.js)

Ukagaka Shell Renderer for Web Browser

![screenshot](https://raw.githubusercontent.com/Ikagaka/Shell.js/master/screenshot1.png )

## About
Shell.js is a `Ukagaka` compatible Shell renderer for HTML canvas.

* [demo](https://ikagaka.github.io/Shell.js/demo/playground.html)




## Usage

```html
<script src="../bower_components/encoding-japanese/encoding.js"></script>
<script src="../bower_components/jszip/dist/jszip.min.js"></script>
<script src="../bower_components/narloader/NarLoader.js"></script>

<script src="../dist/Shell.js"></script>
<script>
NarLoader
.loadFromURL("../nar/mobilemaster.nar")
.then(function(nanikaDir){
  var shellDir = nanikaDir.getDirectory("shell/master").asArrayBuffer();
  var shell = new Shell.Shell(shellDir);
  return shell.load();
}).then(function(shell){
  var div = document.createElement("div");
  var srf = shell.attachSurface(div, 0, 0);
  console.dir(srf);
  srf.on("mouseclick", function(ev){ console.log(ev); });
  document.body.appendChild(div);
}).catch(function(err){
  console.error(err, err.stack);
});
</script>
```

## ChangeLog
* [release log](https://github.com/Ikagaka/Shell.js/releases)

## Development
```sh
npm run setup
npm run init
npm run start
```


## Document
* 型はTypeScriptで、サンプルコードはCoffeeScriptで書かれています。

### Shell Class
* `Shell/***/` 以下のファイルを扱います。
* surfaces.txtなどをパースして情報をまとめて保持します。
* canvas要素にSurfaceクラスを割り当てるためのクラスです。

#### constructor(directory: { [path: string]: ArrayBuffer; }): Shell
* コンストラクタです

#### load(): Promise<Shell>
* `Shell/master/` 以下のファイル一覧とそのArrayBufferを持つObjectを渡してください。
* ArrayBufferはnarファイルをzip解凍や、
  ネットワーク更新用の`updates2.dau`をXHRして入手してください。
* ディレクトリ区切りは UNIXと同じ`/`を使ってください。
  windowsの`\`は対応していません。
* このファイルパスと値のkey-value形式で渡す引数は、
  メモリを多く消費するため、将来的に変更される可能性があります。

```coffeescript

shellDir =
  "descript.txt": new ArrayBuffer()
  "surface0.png": new ArrayBuffer()
  "elements/element0.png": new ArrayBuffer()
  "surfaces.txt": new ArrayBuffer()

shell = new Shell(shellDir)
```

#### unload(): void
* Shellクラスが管理しているすべてのリソースを開放します。
* すべてのサーフェスがdetachSurfaceされます。
* すべてのイベントハンドラも解除されます。
* すべてのプロパティにnullが代入され、GCを促します

#### descript: { [key: string]: string; }
* descript.txtの中身をkey-value形式で持っています。

```coffeescript
shell.load().then (shell)->
  console.log(shell.descript)
```

#### attatchSurface(div: HTMLDivElement, scopeId: number, surfaceId: number|string): Surface|null
* 指定したdivの中にcanvas要素を追加しscopeIdのsurfaceIdのサーフェスの描画を行います。
  * SakuraScriptでなら`\0\s[0]`に該当します。
* surfaceIdはサーフェスエイリアスが考慮されます。
  * 該当するサーフェスが存在しなかった場合、nullが返ります。


```coffeescript

cnv = document.createElement("canvas")
srf = shell.attachSurface(cnv, 0, 0) # \0\s[0]
document.body.appendChild(cnv)
cnv2 = document.createElement("canvas")
srf2 = shell.attachSurface(cnv, 0, "びっくり") # \0\s[びっくり]
document.body.appendChild(cnv2)
```
#### detachSurface(div: HTMLDivElement): void
* attachSurfaceしたdivを描画対象から外します。
* ___サーフェスを変更する前に必ず呼び出してください___

#### bind(category: string, parts: string): void
* `\![bind,カテゴリ名,パーツ名,1]` 相当

#### bind(scopeId: number, bindgroupId: number): void
* `scopeId` 番目のキャラクターの`bindgroupId`の着せ替えを着せます。

#### unbind(category: string, parts: string): void
* `\![bind,カテゴリ名,パーツ名,0]` 相当

#### unbind(scopeId: number, bindgroupId: number): void
* `scopeId` 番目のキャラクターの`bindgroupId`の着せ替えを脱がせます。

#### showRegion(): void
* このシェルの当たり判定を表示します。

#### hideRegion(): void
* このシェルの当たり判定を非表示にします。

#### on("mouse", callback: (event: SurfaceMouseEvent)=> void): void
* マウスイベントのイベントリスナーです。
* 対応しているイベントは以下の通りです。
  * `mouse`
    * タッチイベントとマウスイベントの区別は現状していません。
    * mousewheelまだ
* 透明領域のマウスイベントにも反応します。 `ev.transparency` で判定してください、。
  * これはsurface canvasレイヤが重なった時のマウスイベントの透過処理のためのフラグです。
  * 複数レイヤ間の重なりの上下順番を管理するNamedMgr.jsなどが使います。
* ShellクラスはEventEmitterを継承しているので`off`や`removeAllListener`などもあります
```typescript

interface SurfaceMouseEvent {
  type: string; // mousedown|mousemove|mouseup|mouseclick|mousedblclick のどれか
  transparency: boolean; // 透明領域ならtrue
  button: number; // マウスのボタン。 https://developer.mozilla.org/ja/docs/Web/API/MouseEvent/button
  offsetX: number; // canvas左上からのx座標
  offsetY: number; // canvas左上からのy座標
  region: string; // collisionの名前,"Bust","Head","Face"など
  scopeId: number; // このサーフェスのスコープ番号
  wheel: number; // mousewheel実装したら使われるかも
  event: UIEvent // 生のDOMイベント。 https://developer.mozilla.org/ja/docs/Web/API/UIEvent
}

```

#### getBindGroups(scopeId: number): {category: string, parts: string, thumbnail: string}[]
* bindgroup[scopeId]: {category: string, parts: string, thumbnail: string};


### Surface Class
* canvas要素にサーフェスを描画します。
  * SERIKOアニメーションを再生します。
  * マウスイベントを捕捉します。

#### render(): void
* サーフェスを再描画します。

#### play(animationId: number, callback?: () => void): void
* animationIdのアニメーションを再生します。
  * アニメーション再生後にcallbackが1度だけ呼ばれます。

#### stop(animationId: number): void
* animationIdのアニメーションを停止します。

#### yenE(): void
* yen-eタイミングのアニメーションを再生します。

#### talk(): void
* talkタイミングのカウンタを進め、
  指定回数呼び出されるとtalkタイミングのアニメーションを再生します。

#### getSurfaceSize(): {width: number, height: number}
* 現在のベースサーフェスの大きさを返します



# Balloon.js

[![npm](https://img.shields.io/npm/v/ikagaka.balloon.js.svg?style=flat)](https://npmjs.com/package/ikagaka.balloon.js) [![bower](https://img.shields.io/bower/v/ikagaka.balloon.js.svg)](http://bower.io/search/?q=ikagaka)

Ukagaka Balloon Surface Renderer for Web Browser

## About
Balloon.js is a `Ukagaka` compatible Balloon Shell renderer for HTML canvas.
<!---
* [demo](https://ikagaka.github.io/Balloon.js/demo/playground.html)
-->

## Usage

<script src="../dist/Balloon.js"></script>
<script>
NarLoader
.loadFromURL("../nar/origin.nar")
.then(function(nanikaDir){
  console.log(nanikaDir.files);
  var balloonDir = nanikaDir.asArrayBuffer();
  var balloon = new Balloon.Balloon(balloonDir);
  return balloon.load();
}).then(function(balloon){
  console.log(balloon);
  var div = document.createElement("div");
  var scopeId = 0;
  var surfaceId = 0;
  balloon.attachBlimp(div, scopeId, surfaceId);
  document.body.appendChild(div);
}).catch(function(err){
  console.error(err);
});
```

## ChangeLog
* [release log](https://github.com/Ikagaka/Balloon.js/releases)

## Development

```sh
npm install -g bower dtsm gulp browserify watchify http-server coffee-script
npm run init
npm run build
```

## Document
* 型はTypeScriptで、サンプルコードはCoffeeScriptで書かれています。


### Balloon Class
#### load(directory: { [path: string]: ArrayBuffer; }): Promise<Shell>
#### unload(): void
#### descript: { [key: string]: string; }
#### attatchSurface(element: HTMLDivElement, scoepId: number, blimpId: number|string): BalloonSurface|null
* blimpId: バルーンサーフェスID
  * 0の時、左側通常バルーン
  * 1の時、右側通常バルーン
  * 2の時、右側大きなバルーン
  * 3の時、左側大きなバルーン

#### detachSurface(element: HTMLDivElement): void
#### on(event: string, callback: (event: BalloonEvent)=> void): void
* `on(event: "mouse", callback: (ev: BalloonMouseEvent)=>void): void`
* `on(event: "select", callback: (ev: BalloonSelectEvent)=>void): void`

```typescript
interface BalloonEvent {
  type: string;
  scopeId: number; // \p[n]
  balloonId: number; // \b[n]
}

interface BalloonMouseEvent extends BalloonEvent {
  type: string; // click|dblclikck|mousemove|mouseup|mousedown
}

interface BalloonSelectEvent extends BalloonEvent {
  type: string; // anchorselect|choiceselect
  id: string;
  text: string;
  args: string[]
}
```

### BalloonSurface Class
#### element: HTMLDivElement
* attatchSurfaceで指定したDiv要素です。
* 以下のように要素が追加されます
  ```jade
  div.blimp
    canvas.blimpCanvas
    div.blimpText
    style[scoepd]
  ```
#### isBalloonLeft: boolean
* 吹き出しがゴーストに向かって左にあるならtrue

#### width: number
* バルーンの横幅px

#### height: number
* バルーンの縦幅px

#### render(): void
* バルーンを再描画します

#### surface(balloonId: number): void
* [`\b[n]`](http://ssp.shillest.net/ukadoc/manual/list_sakura_script.html#_b_ID番号_)
* このメソッドを使ってもバルーンの左右位置は変えられません。
* `Blimp#left()`, `Blimp#rihgt()`を使ってください。

#### left(): void
* バルーンを左向き表示にします

#### right(): void
* バルーンを右向き表示にします

#### anchorBegin(id: string, ...args: string[]): void
* [`\_a[anchorId]`, `\_a[anchorId,...]`](http://ssp.shillest.net/ukadoc/manual/list_sakura_script.html#__a_ID_)

#### anchorEnd(): void
* [`\_a`](http://ssp.shillest.net/ukadoc/manual/list_sakura_script.html#__a_ID_)

#### choice(text: string, id: string, ...args: string[]): void
* [`\q[label, choiceId] \q[label, choiceId, ...]`](http://ssp.shillest.net/ukadoc/manual/list_sakura_script.html#_q_タイトル,ID_)

#### choiceBegin(id: string, ...args: string)[]: void
* [`\__q[choiceId] \__q[choiceId,...]`](http://ssp.shillest.net/ukadoc/manual/list_sakura_script.html#___q_ID,..._)

#### choiceEnd(): void
* [`\__q`](http://ssp.shillest.net/ukadoc/manual/list_sakura_script.html#___q_ID,..._)

#### talk(test: string): void
* バルーンの現在のカーソル位置に文字を追加します

#### marker(): void
* [`\![*]`](http://ssp.shillest.net/ukadoc/manual/list_sakura_script.html#_!_*_)

#### clear(): void
* [`\c`](http://ssp.shillest.net/ukadoc/manual/list_sakura_script.html#_c)

#### br(ratio: number): void
* [`\n`, `\n[half]`, `\n[ratio]`](http://ssp.shillest.net/ukadoc/manual/list_sakura_script.html#_n)

#### showWait(): void
* [`\x`](http://ssp.shillest.net/ukadoc/manual/list_sakura_script.html#_x)

#### font(name: string, ...values: string[]): void
* [`\f[]`](http://ssp.shillest.net/ukadoc/manual/list_sakura_script.html#_f_cursorstyle,形状_)

#### location( x: string, y?: string ): void
* [`\_l[x,y]`](http://ssp.shillest.net/ukadoc/manual/list_sakura_script.html#__l_x,y_)

# NamedManager.js

[![npm](https://img.shields.io/npm/v/ikagaka.namedmanager.js.svg?style=flat)](https://npmjs.com/package/ikagaka.namedmanager.js) [![bower](https://img.shields.io/bower/v/ikagaka.namedmanager.js.svg)](http://bower.io/search/?q=ikagaka)
[![Build Status](https://travis-ci.org/Ikagaka/NamedManager.js.svg?branch=master)](https://travis-ci.org/Ikagaka/NamedManager.js)

Ikagaka Window Manager

![screenshot](https://raw.githubusercontent.com/Ikagaka/NamedManager.js/master/screenshot.gif)

## About
NamedManager.js is a `Ukagaka` compatible Shell renderer and Window Manager for Web Browser.

* [demo](http://ikagaka.github.io/NamedManager.js/demo/sandbox.html)


<script src="../bower_components/encoding-japanese/encoding.js"></script>
<script src="../bower_components/jszip/dist/jszip.min.js"></script>
<script src="../bower_components/narloader/NarLoader.js"></script>
<script src="../dist/NamedManager.js"></script>
<script>
Promise.all([
  NarLoader.loadFromURL("../nar/origin.nar"),
  NarLoader.loadFromURL("../nar/mobilemaster.nar")
]).then(function(tmp){
  var balloonNDir = tmp[0];
  var shellNDir = tmp[1];
  var balloonDir = balloonNDir.asArrayBuffer();
  var shellDir = shellNDir.getDirectory("shell/master").asArrayBuffer();
  var shell = new NamedManager.Shell(shellDir);
  var balloon = new NamedManager.Balloon(balloonDir);
  return Promise.all([
    shell.load(),
    balloon.load()
  ]);
}).then(function(tmp){
  var shell = tmp[0];
  var balloon = tmp[1];

  var nmdmgr = new NamedManager.NamedManager();
  document.body.appendChild(nmdmgr.element);

  var hwnd = nmdmgr.materialize(shell, balloon);
  var named = nmdmgr.named(hwnd);

  console.log(nmdmgr, hwnd, named, shell, balloon);

  talk(named);
});

function wait(ms, callback) {
  return function(ctx) {
    return new Promise(function(resolve) {
      setTimeout((function() {
        callback(ctx);
        resolve(ctx);
      }), ms);
    });
  };
}

function talk(named){
  Promise.resolve(named)
  .then(wait(0, function(named) { named.scope(0); }))
  .then(wait(0, function(named) { named.scope().surface(0); }))
  .then(wait(0, function(named) { named.scope().blimp().clear(); }))
  .then(wait(0, function(named) { named.scope(1); }))
  .then(wait(0, function(named) { named.scope().surface(10); }))
  .then(wait(0, function(named) { named.scope().blimp().clear(); }))
  .then(wait(0, function(named) { named.scope(0); }))
  .then(wait(0, function(named) { named.scope().blimp(0); }))
  .then(wait(80, function(named) { named.scope().blimp().talk("H"); }))
  .then(wait(80, function(named) { named.scope().blimp().talk("e"); }))
  .then(wait(80, function(named) { named.scope().blimp().talk("l"); }))
  .then(wait(80, function(named) { named.scope().blimp().talk("l"); }))
  .then(wait(80, function(named) { named.scope().blimp().talk("o"); }))
  .then(wait(80, function(named) { named.scope().blimp().talk(","); }))
  .then(wait(80, function(named) { named.scope().blimp().talk("w"); }))
  .then(wait(80, function(named) { named.scope().blimp().talk("o"); }))
  .then(wait(80, function(named) { named.scope().blimp().talk("r"); }))
  .then(wait(80, function(named) { named.scope().blimp().talk("l"); }))
  .then(wait(80, function(named) { named.scope().blimp().talk("d"); }))
  .then(wait(80, function(named) { named.scope().blimp().talk("!"); }));
}
</script>

```

## ChangeLog
* [release note](https://github.com/Ikagaka/NamedManager.js/releases)

## Development
```sh
npm install -g bower dtsm gulp browserify watchify http-server
npm run init
npm run build
```

## Document
* 型はTypeScriptで、HTMLはJadeで、サンプルコードはCoffeeScriptで書かれています。

### NamedManager Class

#### constructor(): NamedManager
* コンストラクタです。

#### element: HTMLDivElement
* `div.namedMgr` が入っています。構造は以下のとおりです。
  ```jade
  div.namedMgr
    style(scoped)
    div.named
      div.scope
        div.surface
          canvas.surfaceCanvas
        div.blimp
          style(scoped)
          canvas.blimpCanvas
          div.blimpText
      div.scope
      ...
    div.named
    ...
  ```
* `document.body.appned`してDOM Treeに入れてください。

#### destructor(): void
* すべてのリソースを開放します

#### materialize(shell: Shell, balloon: Balloon): namedId
#### materialize2(shell: Shell, balloon: Balloon): Named
* ゴーストのDOMを構築しシェルのレンダリングを開始します

#### vanish(namedId: number): void
* `namedId`のゴーストのDOM構造を消しシェルのレンダリングを終了します。

#### named(namedId: number): Named;
* `namedId`のNamedクラスのインスタンスを返します

### Named Class

#### namedId: number
* このNamedのIDです

#### scope(scopeId?: number): Scope
* `scopeId`のScopeクラスのインスタンスを返します。
* まだ存在しないスコープの場合、新しいスコープを追加します。
* 引数を省略した場合、現在のスコープを返します。

#### openInputBox(id: string, placeHolder?: string): void
* inputboxを表示します。

#### openCommunicateBox(placeHolder?: string): void
* communicateboxを表示します。

#### contextmenu((ev: ContextMenuEvent)=> ContextMenuObject): void
* 内部で  [swisnl/jQuery-contextMenu](https://github.com/swisnl/jQuery-contextMenu) を使っています

```typescript
interface ContextMenuEvent {
  type: string;
  scopeId: number;
  event: UIEvent;
}
interface ContextMenuObject {
  callback?: (itemId: string)=> void;
  items: {[itemId: string]: Item|SubGroup}
}
interface Item {
  name: string;
  callback?: (itemId: string)=> void;
}
interface SubGroup {
  name: string;
  items: {[key: string]: Item|SubGroup};
}
```
sample code
```typescript
named.contextmenu((ev)=>{
  return {
    items: {
      install: { name: "インストールする？"}
    },
    callback: (id)=>{
      switch(id){
        case "install":
          something();
          break;
      }
    }
  };
});
```

#### on(event: string, callback: (ev: {type: string})=> void): void

```typescript
interface SurfaceMouseEvent {
  type: string; // mousedown|mousemove|mouseup|mouseclick|mousedblclick のどれか
  transparency: boolean; // true
  button: number; // マウスのボタン。 https://developer.mozilla.org/ja/docs/Web/API/MouseEvent/button
  offsetX: number; // canvas左上からのx座標
  offsetY: number; // canvas左上からのy座標
  region: string; // collisionの名前,"Bust","Head","Face"など
  scopeId: number; // このサーフェスのスコープ番号
  wheel: number; // mousewheel実装したら使われるかも
  event: UIEvent // 生のDOMイベント。 https://developer.mozilla.org/ja/docs/Web/API/UIEvent
}
interface BalloonMouseEvent {
  type: string; // click|dblclikck|mousemove|mouseup|mousedown
  scopeId: number; // \p[n]
  balloonId: number; // \b[n]
}

interface BalloonInputEvent {
  type: string; //userinput|communicateinput
  id: string;
  content: string;
}

interface BalloonSelectEvent {
  type: string; //anchorselect|choiceselect
  id: string;
  text: string;
  args: string[];
}

interface FileDropEvent {
  type: string; //filedrop
  scopeId: number;
  event: UIEvent;
}
```

##### on(event: "mousedown", callback: (ev: SurfaceMouseEvent)=> void): void
##### on(event: "mousemove", callback: (ev: SurfaceMouseEvent)=> void): void
##### on(event: "mouseup", callback: (ev: SurfaceMouseEvent)=> void): void
##### on(event: "mouseclick", callback: (ev: SurfaceMouseEvent)=> void): void
##### on(event: "mousedblclick", callback: (ev: SurfaceMouseEvent)=> void): void
##### on(event: "balloonclick", callback: (ev: BalloonMouseEvent)=> void): void
##### on(event: "balloondblclick", callback: (ev: BalloonMouseEvent)=> void): void
##### on(event: "anchorselect", callback: (ev: BalloonSelectEvent)=> void): void
##### on(event: "choiceselect", callback: (ev: BalloonSelectEvent)=> void): void
##### on(event: "userinput", callback: (ev: BalloonInputEvent)=> void): void
##### on(event: "communicateinput", callback: (ev: BalloonInputEvent)=> void): void
##### on(event: "filedrop", callback: (ev: FileDropEvent)=> void): void

#### changeShell(shell: Shell): void
* 現在のシェルを動的に変更します。

#### changeBalloon(balloon: Balloon): void
* 現在のバルーンシェルを動的に変更します。

### Scope Class

#### surface(surfaceId?: number|string): Surface
* numberのとき
  * `surfaceId` のサーフェスを表示し、Surfaceクラスのインスタンスを返します。
* stringのとき
  * `surfaceAlias`のサーフェスエイリアスのサーフェスを表示し、Surfaceクラスのインスタンスを返します。
* 指定したサーフェスが存在しない場合、現在のサーフェスのSurfaceを返します。
* 引数を省略した場合、現在のSurfaceを返します。

#### blimp(blimpId?: number): Blimp
* `blimpId`のバルーンを表示します。
* 引数を省略した場合、現在のBlimpを返します。


#### position(pos?:{right: number, bottom: number}): {right: number, bottom: number}
* 指定した座標に移動します。
* 基準は画面右下です。
* 引数を省略すると現在の座標が返ります。
