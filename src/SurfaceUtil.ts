/**
 * extend deep like jQuery $.extend(true, target, source)
 */
export function extend(target: any, source: any): void {
  for(var key in source){
    if (typeof source[key] === "object" && Object.getPrototypeOf(source[key]) === Object.prototype) {
      target[key] = target[key] || {};
      extend(target[key], source[key]);
    } else if (Array.isArray(source[key])) {
      target[key] = target[key] || [];
      extend(target[key], source[key]);
    } else if (source[key] !== undefined) {
      target[key] = source[key];
    }
  }
}

/**
 * "hoge.huga, foo, bar\n" to {"hoge.huga": "foo, bar"}
 */
export function parseDescript(text: string): {[key:string]:string}{
  text = text.replace(/(?:\r\n|\r|\n)/g, "\n"); // CRLF->LF
  while(true){// remove commentout
    var match = (/(?:(?:^|\s)\/\/.*)|^\s+?$/g.exec(text) || ["",""])[0];
    if(match.length === 0) break;
    text = text.replace(match, "");
  }
  var lines = text.split("\n");
  lines = lines.filter(function(line){ return line.length !== 0; }); // remove no content line
  var dic = lines.reduce<{[key:string]:string}>(function(dic, line){
    var tmp = line.split(",");
    var key = tmp[0];
    var vals = tmp.slice(1);
    key = key.trim();
    var val = vals.join(",").trim();
    dic[key] = val;
    return dic;
  }, {});
  return dic;
}


/**
 * convert some encoding txt file arraybuffer to js string
 */
export function convert(buffer: ArrayBuffer):string{
  //return new TextDecoder('shift_jis').decode(buffer);
  return Encoding.codeToString(Encoding.convert(new Uint8Array(buffer), 'UNICODE', 'AUTO'));
}

/**
 * find filename that matches arg "filename" from arg "paths"
 */
export function find(paths: string[], filename: string): string[] {
  filename = filename.split("\\").join("/");
  if(filename.slice(0,2) === "./") filename = filename.slice(2);
  var reg =new RegExp("^"+filename.replace(".", "\.")+"$", "i");
  var hits = paths.filter((key)=> reg.test(key));
  return hits;
}


export function choice<T>(arr: T[]): T {
  return arr[Math.round(Math.random()*(arr.length-1))];
}

export function copy(cnv: HTMLCanvasElement|HTMLImageElement): HTMLCanvasElement {
  var _copy = document.createElement("canvas");
  var ctx = <CanvasRenderingContext2D>_copy.getContext("2d");
  _copy.width = cnv.width;
  _copy.height = cnv.height;
  ctx.drawImage(<HTMLCanvasElement>cnv, 0, 0); // type hack
  return _copy;
}

export function fetchPNGUint8ClampedArrayFromArrayBuffer(pngbuf: ArrayBuffer, pnabuf?: ArrayBuffer): Promise<{width:number, height:number, data:Uint8ClampedArray}> {
  return new Promise((resolve,reject)=>{/*
    var reader = new PNGReader(pngbuf);
    var png = reader.parse();
    var dataA = png.getUint8ClampedArray();
    if(typeof pnabuf === "undefined"){
      var r = dataA[0], g = dataA[1], b = dataA[2], a = dataA[3];
      var i = 0;
      if (a !== 0) {
        while (i < dataA.length) {
          if (r === dataA[i] && g === dataA[i + 1] && b === dataA[i + 2]) {
            dataA[i + 3] = 0;
          }
          i += 4;
        }
      }
      return resolve(Promise.resolve({width: png.width, height: png.height, data: dataA}));
    }
    var pnareader = new PNGReader(pnabuf);
    var pna = pnareader.parse();
    var dataB = pna.getUint8ClampedArray();
    if(dataA.length !== dataB.length){
      return reject("fetchPNGUint8ClampedArrayFromArrayBuffer TypeError: png" +
      png.width+"x"+png.height+" and  pna"+pna.width+"x"+pna.height +
      " do not match both sizes");
    }
    var j = 0;
    while (j < dataA.length) {
      dataA[j + 3] = dataB[j];
      j += 4;
    }
    return resolve(Promise.resolve({width: png.width, height: png.height, data: dataA}));
    */
  }).catch((err)=>{
    return Promise.reject("fetchPNGUint8ClampedArrayFromArrayBuffer msg:"+err+", reason: "+err.stack);
  });
}


export function fetchImageFromArrayBuffer(buffer: ArrayBuffer, mimetype?:string): Promise<HTMLImageElement> {
  var url = URL.createObjectURL(new Blob([buffer], {type: mimetype || "image/png"}));
  return fetchImageFromURL(url).then((img)=>{
    URL.revokeObjectURL(url);
    return Promise.resolve(img);
  }).catch((err)=>{
    return Promise.reject("fetchImageFromArrayBuffer > "+err);
  });
}

export function fetchImageFromURL(url: string): Promise<HTMLImageElement> {
  var img = new Image();
  img.src = url;
  return new Promise<HTMLImageElement>((resolve, reject)=>{
    img.addEventListener("load", function() {
      resolve(Promise.resolve(img)); // type hack
    });
    img.addEventListener("error", function(ev) {
      console.error("fetchImageFromURL", ev);
      reject("fetchImageFromURL ");
    });
  });
}

export function random(callback: (nextTick: () => void) => void, probability: number): void {
  var ms = 1;
  while (Math.round(Math.random() * 1000) > 1000 / probability) {
    ms++;
  }
  setTimeout((() =>{
    var nextTick = () => random(callback, probability);
    callback(nextTick);
  }), ms * 1000);
}

export function periodic(callback: (callback: () => void) => void, sec: number): void {
  setTimeout((() =>
    callback(()=>
      periodic(callback, sec)
    )
  ), sec * 1000);
}

export function always(  callback: (callback: () => void) => void): void {
  callback(() => always(callback) );
}

export function isHit(cnv: HTMLCanvasElement, x: number, y: number ): boolean {
  var ctx = <CanvasRenderingContext2D>cnv.getContext("2d");
  var imgdata = ctx.getImageData(0, 0, x + 1, y + 1);
  var data = imgdata.data;
  return data[data.length - 1] !== 0;
}

export function offset(element: Element): {left: number, top: number, width: number, height: number} {
  var obj = element.getBoundingClientRect();
  return {
    left: obj.left + window.pageXOffset,
    top: obj.top + window.pageYOffset,
    width: Math.round(obj.width),
    height: Math.round(obj.height)
  };
}

export function createCanvas(): HTMLCanvasElement {
  var cnv = document.createElement("canvas");
  cnv.width = 1;
  cnv.height = 1;
  return cnv;
}

export function scope(scopeId: number): string {
  return scopeId === 0 ? "sakura"
       : scopeId === 1 ? "kero"
       : "char"+scopeId;
}

/*
var _charId = charId === "sakura" ? 0
            : charId === "kero"   ? 1
            : Number(/^char(\d+)/.exec(charId)[1]);
*/

/*
@isHitBubble = (element, pageX, pageY)->
  $(element).hide()
  elm = document.elementFromPoint(pageX, pageY)
  if !elm
    $(element).show(); return elm
  unless elm instanceof HTMLCanvasElement
    $(element).show(); return elm
  {top, left} = $(elm).offset()
  if Surface.isHit(elm, pageX-left, pageY-top)
    $(element).show(); return elm
  _elm = Surface.isHitBubble(elm, pageX, pageY)
  $(element).show(); return _elm
*/

// ↑この死にコードなんだよ

/*
以下Named.jsから呼ばれなくなった死にコード
export function elementFromPointWithout (element: HTMLElement, pageX: number, pageY: number): Element {
  var tmp = element.style.display;
  element.style.display = "none";
  // elementを非表示にして直下の要素を調べる
  var elm = document.elementFromPoint(pageX, pageY);
  // 直下の要素がcanvasなら透明かどうか調べる
  // todo: cuttlebone管理下の要素かどうかの判定必要
  if (!elm){
    element.style.display = tmp;
    return elm;
  }
  if (!(elm instanceof HTMLCanvasElement)) {
    element.style.display = tmp;
    return elm;
  }
  var {top, left} = offset(elm);
  // 不透明canvasならヒット
  if (elm instanceof HTMLCanvasElement && isHit(elm, pageX - left, pageY - top)) {
    element.style.display = tmp;
    return elm;
  }
  if(elm instanceof HTMLElement){
    // elementの非表示のままさらに下の要素を調べにいく
    var _elm = elementFromPointWithout(elm, pageX, pageY)
    element.style.display = tmp;
    return _elm;
  }
  // 解決できなかった！ザンネン!
  console.warn(elm);
  element.style.display = tmp;
  return null;
}
*/

export function randomRange(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}
