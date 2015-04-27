# Shell.js

![screenshot](https://raw.githubusercontent.com/Ikagaka/Shell.js/master/screenshot1.png )
![screenshot](https://raw.githubusercontent.com/Ikagaka/Shell.js/master/screenshot2.gif )

+ [demo](https://ikagaka.github.io/Shell.demo/node_modules/ikagaka.shell.js/test/test.html)
+ [wiki](https://github.com/Ikagaka/Shell.js/wiki/Shell.js )


```html
<script src="./node_modules/ikagaka.nar.js/node_modules/encoding-japanese/encoding.js"></script>
<script src="./node_modules/ikagaka.nar.js/vendor/jszip.min.js"></script>
<script src="./node_modules/ikagaka.nar.js/vendor/XHRProxy.min.js"></script>
<script src="./node_modules/ikagaka.nar.js/vendor/WMDescript.js"></script>
<script src="./node_modules/ikagaka.nar.js/Nar.js"></script>
<script src="./node_modules/surfaces_txt2yaml/lib/surfaces_txt2yaml.js"></script>
<script src="./node_modules/underscore/underscore-min.js"></script>
<script src="./node_modules/zepto/zepto.min.js"></script>
<script src="./node_modules/es6-shim/es6-shim.min.js"></script>
<script src="./SurfaceUtil.js"></script>
<script src="./Surface.js"></script>
<script src="./Shell.js"></script>
<canvas id="surface"></canvas>
<script>
var loader = new Nar.Loader();
loader.loadFromURL("./node_modules/ikagaka.nar.js/vendor/mobilemaster.nar", function (err, nar){
  if(!!err) return console.error(err.stack);

  if(nar.install["type"] === "ghost"){
    var shellDir = nar.getDirectory(/shell\/master\//);
    var shell = new Shell(shellDir);

  }else if(nar.install["type"] === "shell"){
    var shell = new Shell(nar.directory);

  }else{
    throw new Error("non support nar file type");

  }

  shell.load().then(function(){
    console.log(shell);

    var surface = shell.attachSurface($("#surface")[0], 0, 7);

    surface.bind(30);
    surface.bind(31);
    surface.bind(32);
    surface.bind(50);

    console.log(surface);
  });
});
</script>
```

## SERIKO

### Compose Method
+ base
+ overlay
+ overlayfast
+ replace
+ add
+ bind
+ interpolate
+ move
+ start
+ stop
+ alternativestart
+ alternativestop

### Interval
+ sometimes
+ rarely
+ random
+ periodic
+ always
+ runonce
+ never
+ bind
+ yen-e
+ talk

## SHIORI Event

+ OnMouseClick
+ OnMouseDoubleClick
+ OnMouseMove
+ OnMouseUp
+ OnMouseDown
