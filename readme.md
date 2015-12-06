# NamedManager.js

[![npm](https://img.shields.io/npm/v/ikagaka.namedmanager.js.svg?style=flat)](https://npmjs.com/package/ikagaka.namedmanager.js) [![bower](https://img.shields.io/bower/v/ikagaka.namedmanager.js.svg)](http://bower.io/search/?q=ikagaka)
[![Build Status](https://travis-ci.org/Ikagaka/NamedManager.js.svg?branch=master)](https://travis-ci.org/Ikagaka/NamedManager.js)

Ikagaka Window Manager

![screenshot](https://raw.githubusercontent.com/Ikagaka/NamedManager.js/master/screenshot.gif)

## About
NamedManager.js is a `Ukagaka` compatible Shell renderer and Window Manager for Web Browser.

* [demo](http://ikagaka.github.io/NamedManager.js/demo/sandbox.html)


## Usage

```html

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
* `document.body.appned`してRealDOMTreeに入れてください。

#### destructor(): void
* すべてのリソースを開放します

#### materialize(shell: Shell, balloon: Balloon): number
* ゴーストのレンダリングを開始します
* 返り値`number`は`namedId`です。いわゆるウインドウハンドラです。

#### vanish(namedId: number): void
* `namedId`のゴーストのレンダリングを終了します。

#### named(namedId: number): Named;
* `namedId`のNamedクラスのインスタンスを返します

### Named Class

#### scope(scopeId?: number): Scope
* `scopeId`のScopeクラスのインスタンスを返します。
* 引数を省略した場合、現在のスコープを返します。

#### openInputBox(id: string, placeHolder?: string): void
* inputboxを表示します。

#### openCommunicateBox(placeHolder?: string): void
* communicateboxを表示します。

#### on(event: "balloon_select", callback: (ev: BalloonSelectEvent)=> void): EventEmitter
* アンカーか選択肢が押された時

#### on(event: "balloon_input", callback: (ev: BalloonInputEvent)=> void): EventEmitter
* ユーザーインプットかコミュニケートがあった時

#### on(event: "shell_mouse", callback: (ev: ShellMouseEvent)=> void): EventEmitter
* サーフェスが触られた時

#### on(event: "balloon_mouse", callback: (ev: BalloonMouseEvent)=> void): EventEmitter
* バルーンが触られた時

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
