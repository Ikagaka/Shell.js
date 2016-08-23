import * as CC from "./CanvasCache";
import * as SU from "./SurfaceUtil";
import narloader = require("narloader");
const NL = narloader.NarLoader;

QUnit.module('CanvasCache');


NL.loadFromURL("/nar/mobilemaster.nar").then((dir)=>{
  const dic = dir.getDirectory("shell/master").asArrayBuffer();
  const cc = new CC.CanvasCache(dic); 
  console.log(cc);

  QUnit.test('CanvasCache.hasFile', (assert)=>{
    assert.ok(cc.hasCache("surface10.png") === "");
    assert.ok(cc.hasFile("surface0.png") !== "");
    assert.ok(cc.hasCache("surface0.png") === "");
    assert.ok(cc.hasFile("surface10.png") !== "");
  });

  QUnit.test('CanvasCache.getCanvas', (assert)=>{
    const done = assert.async();
    assert.ok(cc.hasCache("surface0.png") === "");
    return cc.getCanvas("surface0.png").then((cnv)=>{
      assert.ok(cnv instanceof HTMLCanvasElement);
      assert.ok(cc.hasCache("surface0.png") !== "");
      document.body.appendChild(document.createTextNode("色抜き後"));
      document.body.appendChild(SU.copy(cnv))
      done();
    });
  });

  QUnit.test('CanvasCache.getCanvas(asis)', (assert)=>{
    const done = assert.async();
    assert.ok(cc.hasCache("surface11.png") === "");
    return cc.getCanvas("surface11.png", false).then((cnv)=>{
      assert.ok(cc.hasCache("surface11.png") !== "");
      assert.ok(cnv instanceof HTMLCanvasElement);
      document.body.appendChild(document.createTextNode("色抜き前"));
      document.body.appendChild(SU.copy(cnv));
      done();
    });
  });

  QUnit.test('CanvasCache.getCanvas(without extention)', (assert)=>{
    const done = assert.async();
    assert.ok(cc.hasCache("surface10") === "");
    return cc.getCanvas("surface10").then((cnv)=>{
      assert.ok(cc.hasCache("surface10") === "", "拡張子が間違っていればそれはキャッシュへのキーにはならない");
      assert.ok(cc.hasCache("surface10.png") !== "", "正しい拡張子でキャッシュされる");
      assert.ok(cnv instanceof HTMLCanvasElement);
      document.body.appendChild(document.createTextNode("色抜き後"));
      document.body.appendChild(SU.copy(cnv));
      done();
    });
  });
  QUnit.test('CanvasCache.getCanvas(use pna)', (assert)=>{
    const done = assert.async();
    assert.ok(cc.hasCache("surface0730.png") === "");
    return cc.getCanvas("surface0730.png").then((cnv)=>{
      assert.ok(cc.hasCache("surface0730.png") !== "");
      assert.ok(cnv instanceof HTMLCanvasElement);
      document.body.appendChild(document.createTextNode("use pna"));
      document.body.appendChild(SU.copy(cnv));
      done();
    });
  });
  QUnit.test('CanvasCache.getCanvas(unuse pna)', (assert)=>{
    const done = assert.async();
    assert.ok(cc.hasCache("surface0731.png") === "");
    return cc.getCanvas("surface0731.png", true).then((cnv)=>{
      assert.ok(cc.hasCache("surface0731.png") === "", "axisするとキャッシュされない");
      assert.ok(cnv instanceof HTMLCanvasElement);
      document.body.appendChild(document.createTextNode("unuse pna"));
      document.body.appendChild(SU.copy(cnv));
      done();
    });
  });
});


