# Shell.js
Ukagaka Shell Renderer for Web Browser

![screenshot](https://raw.githubusercontent.com/Ikagaka/cuttlebone/master/screenshot1.png )

![screenshot](https://raw.githubusercontent.com/Ikagaka/cuttlebone/master/screenshot2.gif )


## Dependence
* surfaces_txt2yaml
* EventEmitter2
* jszip
* NarLoader


## Usage
```html

<script src="../bower_components/eventemitter2/lib/eventemitter2.js"></script>
<script src="../bower_components/jquery/dist/jquery.min.js"></script>
<script src="../bower_components/encoding-japanese/encoding.js"></script>
<script src="../bower_components/jszip/dist/jszip.min.js"></script>
<script src="../bower_components/narloader/NarLoader.js"></script>
<script src="../bower_components/surfaces_txt2yaml/lib/surfaces_txt2yaml.js"></script>
<script src="../dist/Shell.js"></script>
<script>
NarLoader
.loadFromURL("../nar/mobilemaster.nar")
.then(function(nanikaDir){
  var shellDir = nanikaDir.getDirectory("shell/master").asArrayBuffer();
  var shell = new Shell.Shell(shellDir);
  return shell.load();
}).then(function(shell){
  var cnv = document.createElement("canvas");
  var srf = shell.attachSurface(cnv, 0, 0);
  console.dir(srf);
  srf.on("mouseclick", function(ev){ console.log(ev); });
  document.body.appendChild(cnv);
}).catch(function(err){
  console.error(err, err.stack);
});
</script>
```


## Development
```sh
npm install -g bower dtsm http-server
npm run init
npm run build
```


## Document
* 型はTypeScriptで、サンプルコードはCoffeeScriptで書かれています。

## Shell Class
* `Shell/master/` 以下のファイルを扱います。
* surfaces.txtなどをパースして情報をまとめて保持します。
* canvas要素にSurfaceクラスを割り当てるためのクラスです。

### load(directory: { [path: string]: ArrayBuffer; }): Promise<Shell>
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

### descript: { [key: string]: string; }
* descript.txtの中身をkey-value形式で持っています。

```coffeescript
shell.load().then (shell)->
  console.log(shell.descript)
```

### attatchSurface(canvas: HTMLCanvasElement, scopeId: number, surfaceId: number|string): Surface|null
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

### bind(charaId: number, bindgroupId: number): void
* `charaId` 番目のキャラクターの`bindgroupId`の着せ替えを着せます。


### unbind(charaId: number, bindgroupId: number): void
* `charaId` 番目のキャラクターの`bindgroupId`の着せ替えを脱がせます。

## Surface Class
* canvas要素にサーフェスを描画します。
  * SERIKOアニメーションを再生します。
  * マウスイベントを捕捉します。

### constructor(canvas: HTMLCanvasElement, scopeId: number, surfaceId: number, shell: Shell): Surface
* canvas要素にサーフェスを描画します。
* このコンストラクタが呼ばれた時からアニメーションが開始されます。
* surfaceIdはサーフェスエイリアスが考慮されません。
  * `attatchSurface`を使って下さい。
```coffeescript
srf = new Sufrace(cnv, 0, 0, shell) # \0\s[0]
```
### destructor(): void
* canvasへのサーフェスの描画を終了します。
* canvasへのあらゆるイベントハンドラを解除します。
* ___サーフェスを変更する前に必ず呼び出してください___

### render(): void
* サーフェスを再描画します。

### play(animationId: number, callback?: () => void): void
* animationIdのアニメーションを再生します。
  * アニメーション再生後にcallbackが1度だけ呼ばれます。

### stop(animationId: number): void
* animationIdのアニメーションを停止します。

### yenE(): void
* yen-eタイミングのアニメーションを再生します。

### talk(): void
* talkタイミングのカウンタを進め、
  指定回数呼び出されるとtalkタイミングのアニメーションを再生します。

### on(type: string, callback: (event: SurfaceMouseEvent)=> void): void
* マウスイベントのイベントリスナーです。
* 対応しているイベントは以下の通りです。
  * `mousedown|mousemove|mouseup|mouseclick|mousedblclick`
  * タッチイベントとマウスイベントの区別は現状していません。
  * mousewheelまだー？
* 透明領域のマウスイベントにも反応します。 `ev.transparency` で判定してください、。
  * これはsurface canvasレイヤが重なった時のマウスイベントの透過処理のためのフラグです。
  * 複数レイヤ間の重なりの上下順番を管理するNamedMgr.jsなどが使います。

```typescript

interface SurfaceMouseEvent {
  button: number; // マウスのボタン
  offsetX: number; // canvas左上からのx座標
  offsetY: number; // canvas左上からのy座標
  region: string; // collisionの名前
  scope: number; // このサーフェスのスコープ番号
  wheel: number; // mousewheel実装したら使われるかも
  type: string; // "Bust","Head","Face"など、collisionのアレ
  transparency: boolean; // 透明領域ならtrue
}
```
