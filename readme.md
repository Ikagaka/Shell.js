# Shell.js
Ukagaka Shell Renderer for Web Browser

![screenshot](https://raw.githubusercontent.com/Ikagaka/cuttlebone/master/screenshot1.png )

![screenshot](https://raw.githubusercontent.com/Ikagaka/cuttlebone/master/screenshot2.gif )

* [demo](https://ikagaka.github.io/cuttlebone.demo/tests/index.html)
* [wiki](https://github.com/Ikagaka/cuttlebone/wiki/)


# Dependence
* surfaces_txt2yaml

# Development
```sh
npm install -g bower dtsm typescript babel browserify
npm install init
```

# Classes
* 型はTypeScriptで、サンプルコードはCoffeeScriptで書かれています。

## Shell Class
* `Shell/master/` 以下のファイルを扱います。
* surfaces.txtなどをパースして情報をまとめて保持します。
* canvas要素にSurfaceクラスを割り当てるためのクラスです。

```coffeescript
shell = new Shell(shellDir)
shell.load().then ->
  cnv = document.createElement("canvas")
  srf = shell.attachSurface(cnv, 0, 0)
  # \0\s[0] 相当のサーフェスをcanvasに描画します。
```

### constructor(directory: { [path: string]: ArrayBuffer; }): Shell
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

### Shell.descript: { [key: string]: string; }
* descript.txtの中身をkey-value形式で持っています。

### Shell.prototype.load(): Promise<Shell>
* construtorに渡されたdirectoryを読み込みます。
* descript.txtやsurfaces.txt、surface.png、surface.pnaファイルを非同期で読み込みます。

```coffeescript
shell.load().then (shell)->
  console.log(shell)
```

### Shell.prototype.attatchSurface(canvas: HTMLCanvasElement, scopeId: number, surfaceId: number|string): Surface|null
* 指定したcanvasへscopeIdのsurfaceIdのサーフェスの描画を行います。
  * SakuraScriptでなら`\0\s[0]`に該当します。
* surfaceIdはサーフェスエイリアスが考慮されます。
  * 該当するサーフェスが存在しなかった場合、nullが返ります。
  * `new Sufrace(cnv, scodeId, surfaceId, shell)` との違いは、
    サーフェスエイリアスが考慮される点です。

```coffeescript
cnv = document.createElement("canvas")
srf = shell.attachSurface(cnv, 0, 0) # \0\s[0]
document.body.appendChild(cnv)
cnv2 = document.createElement("canvas")
srf2 = shell.attachSurface(cnv, 0, "びっくり") # \0\s[びっくり]
document.body.appendChild(cnv2)
```

## Surface Class
* canvas要素にサーフェスを描画します。
  * SERIKOアニメーションを再生します。
  * マウスイベントを捕捉します。

### constructor(canvas: HTMLCanvasElement, scopeId: number, surfaceId: number, shell: Shell): Surface
* canvas要素にサーフェスを描画します。
* このコンストラクタが呼ばれた時からアニメーションが開始されます。
* surfaceIdはサーフェスエイリアスが考慮されません。
  * `Shell.prototype.attatchSurface`を使って下さい。
```coffeescript
srf = new Sufrace(cnv, 0, 0, shell) # \0\s[0]
```
### Surface.prototype.destructor(): void
* canvasへのサーフェスの描画を終了します。
* canvasへのあらゆるイベントハンドラを解除します。
* サーフェスを変更する前に必ず呼び出してください。

### Surface.prototype.render(): void
* サーフェスを再描画します。

### Surface.prototype.play(animationId: number, callback?: () => void): void
* animationIdのアニメーションを再生します。
  * アニメーション再生後にcallbackが1度だけ呼ばれます。

### Surface.prototype.stop(animationId: number): void
* animationIdのアニメーションを停止します。

### Surface.prototype.bind(animationId: number): void
* animationIdの着せ替えを着せます。

### Surface.prototype.unbind(animationId: number): void
* animationIdの着せ替えを脱がせます。

### Surface.prototype.yenE(): void
* yen-eタイミングのアニメーションを再生します。

### Surface.prototype.talk(): void
* talkタイミングのカウンタを進め、
  指定回数呼び出されるとtalkタイミングのアニメーションを再生します。
### Surface.prototype.on(eventName: string, callback: (event: Event)=> void): void
* マウスイベントのイベントリスナーです。
* イベントの詳細については以下の通りです。

#### Surface.prototype.on("mousedown", callback: (event: MousedownEvent)=> void): void

```typescript
interface MousedownEvent{
  button: number; // マウスのボタン
  offsetX: number; // canvas左上からのx座標
  offsetY: number; // canvas左上からのy座標
  region: string; // collisionの名前
  scopeId: number; // このサーフェスのスコープ番号
  wheel: number; // 0
  type: string; // "mousedown"
}
```

#### Surface.prototype.on("mousemove", callback: (event: MousemoveEvent)=> void): void

```typescript
interface MousemoveEvent{
  button: number; // マウスのボタン
  offsetX: number; // canvas左上からのx座標
  offsetY: number; // canvas左上からのy座標
  region: string; // collisionの名前
  scopeId: number; // このサーフェスのスコープ番号
  wheel: number; // 0
  type: string; // "mousemove"
}
```

#### Surface.prototype.on("mouseup", callback: (event: MouseupEvent)=> void): void

```typescript
interface MouseupEvent{
  button: number; // マウスのボタン
  offsetX: number; // canvas左上からのx座標
  offsetY: number; // canvas左上からのy座標
  region: string; // collisionの名前
  scopeId: number; // このサーフェスのスコープ番号
  wheel: number; // 0
  type: string; // "mouseup"
}
```

#### Surface.prototype.on("mouseclick", callback: (event: MouseclickEvent)=> void): void

```typescript
interface MouseclickEvent{
  button: number; // マウスのボタン
  offsetX: number; // canvas左上からのx座標
  offsetY: number; // canvas左上からのy座標
  region: string; // collisionの名前
  scopeId: number; // このサーフェスのスコープ番号
  wheel: number; // 0
  type: string; // "mouseclick"
}
```

#### Surface.prototype.on("mousedblclick", callback: (event: MousedbllickEvent)=> void): void

```typescript
interface MousedbllickEvent{
  button: number; // マウスのボタン
  offsetX: number; // canvas左上からのx座標
  offsetY: number; // canvas左上からのy座標
  region: string; // collisionの名前
  scopeId: number; // このサーフェスのスコープ番号
  wheel: number; // 0
  type: string; // "mousedblclick"
}
```

#### Surface.prototype.on("mousewheel", callback: (event: MousewheelEvent)=> void): void

```typescript
interface MousewheelEvent{
  button: number; // マウスのボタン
  offsetX: number; // canvas左上からのx座標
  offsetY: number; // canvas左上からのy座標
  region: string; // collisionの名前
  scopeId: number; // このサーフェスのスコープ番号
  wheel: number; // 0
  type: string; // "mousewheel"
}
```
