/// <reference path="../typings/index.d.ts"/>

import * as CCC from "./CacheCanvas";
import * as JSZip from "jszip";

QUnit.module('CCC');

  QUnit.test('CCC.getArrayBufferFromURL', (assert)=>{
    const done = assert.async();
    return Promise.all([
      CCC.getArrayBufferFromURL("/nar/mobilemaster.nar").then((buf)=>{
        assert.ok(buf instanceof ArrayBuffer);
        assert.ok(buf.byteLength > 0);
      }),
      CCC.getArrayBufferFromURL("/nar/mobilemaster.zip").catch((err)=>{
        assert.ok(err instanceof Error);
      })
    ]).then(()=> done());
  });

unzip("/nar/mobilemaster.nar").then((dic)=>{

  QUnit.test('CCC.getImageFromArrayBuffer', (assert)=>{
    const done = assert.async();
    const buf = dic["shell/master/surface0.png"];
    assert.ok(buf instanceof ArrayBuffer);
    assert.ok(buf.byteLength > 0);
    return CCC.getImageFromArrayBuffer(buf).then((img)=>{
      assert.ok(img instanceof Image);
      assert.ok(img.width > 0);
      assert.ok(img.height > 0);
      done();
    });
  });

  QUnit.test('CCC.getPNGAndPNAImage', (assert)=>{
    const done = assert.async();
    const pngBuf = dic["shell/master/surface0731.png"];
    const pnaBuf = dic["shell/master/surface0731.pna"];
    return CCC.getPNGAndPNAImage(pngBuf, pnaBuf)
    .then((cache)=>{
      assert.ok(cache.png instanceof Image);
      assert.ok(cache.pna instanceof Image);
      done();
    });
  });

  QUnit.test('CCC.getPNGImage', (assert)=>{
    const done = assert.async();
    const pngBuf = dic["shell/master/surface0731.png"];
    return CCC.getPNGImage(pngBuf)
    .then((cache)=>{
      assert.ok(cache.png instanceof Image);
      done();
    });
  });

  QUnit.test('CCC.applyChromakey', (assert)=>{
    const done = assert.async();
    const pngBuf = dic["shell/master/surface0731.png"];
    const pnaBuf = dic["shell/master/surface0731.pna"];
    return Promise.all<CCC.Cache<CCC.Yet>>([
      CCC.getPNGImage(pngBuf),
      CCC.getPNGAndPNAImage(pngBuf, pnaBuf)
    ]).then((caches)=>
      Promise.all(caches.map((cache)=> CCC.applyChromakey(cache) ))
    ).then((loadeds)=>{
      loadeds.forEach((loaded)=>{
        assert.ok(loaded.cnv instanceof HTMLCanvasElement);
        assert.ok(loaded.png instanceof Image);
      });
      done();
    });
  });

});


function unzip(url: string): Promise<{[key:string]: ArrayBuffer}>{
  const jszip = new JSZip();
  return CCC.getArrayBufferFromURL(url)
  .then((buf)=> jszip.loadAsync(buf))
  .then((zip)=>{
    const pairs = Object.keys(zip.files)
      .map((filename)=> ({filename, zipped: zip.file(filename)}) );
    const proms = pairs.map(({filename, zipped})=>
      (<JSZipObject>zipped).async("arraybuffer")
      .then((unzipped: ArrayBuffer)=> ({filename, unzipped}) )
    );
    return Promise.all(proms);
  }).then((pairs)=>{
    console.warn(pairs)
    const dic = pairs.reduce<{[key:string]: ArrayBuffer}>(
      (o, {filename, unzipped})=>{ o[filename] = unzipped; return o; }, {});
    console.info(dic);
    return dic;
  });
}