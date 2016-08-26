import * as SC from "../Model/Config";
import * as SCL from "../Loader/Config";
import * as SU from "../Util/index";


QUnit.module('ShellConfigLoader');


SU.NarLoader.loadFromURL("/nar/mobilemaster.nar").then((dir)=>{
  const dic = dir.asArrayBuffer();
  const name = SU.fastfind(Object.keys(dic), "descript.txt");
  const descript = SU.parseDescript(SU.convert(dic[name]));

  QUnit.test('ShellConfigLoader.loadFromJSONLike', (assert)=>{
    const done = assert.async();
    return SCL.loadFromJSONLike(descript)
    .then((config)=>{
      assert.ok(config.seriko instanceof SC.Seriko);
      assert.ok(config.seriko.use_self_alpha === false);
      assert.ok(config.seriko.alignmenttodesktop === "bottom");
      assert.ok(config.menu instanceof SC.Menu);
      assert.ok(config.char instanceof Array);
      assert.ok(config.bindgroup instanceof Array);
      assert.ok(typeof config.enableRegion === "boolean");
      assert.ok(typeof config.position === "string");
      done();
    });
  });

});


