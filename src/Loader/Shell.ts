/*
 * shell/master/*** ディレクトリから shell モデルを構築する
 */

import * as Util from "../Util/index";
import {Shell} from "../Model/Shell";
import {Config, JSONLike, Char, BindGroup, Descript} from "../Model/Config";
import {SurfaceDefinitionTree, SurfaceDefinition, SurfaceElement} from "../Model/SurfaceDefinitionTree";
import * as SCL from "./Config";
import * as STL from "./SurfaceDefinitionTree";
import * as SY from "surfaces_txt2yaml";

export type Directory = { [filepath: string]: ArrayBuffer };

export function load(directory: Directory): Promise<Shell>{
  return loadDescript(directory)
  .then(({descript, descriptJSON, config})=>
    loadSurfacesTxt(directory)
    .then(({ surfacesTxt, surfaceDefTree })=>
      loadSurfaceTable(directory)
      .then(()=>
        loadSurfacePNG(directory, surfaceDefTree)
        .then((surfaceDefTree)=>{
          const shell = new Shell();
          
          shell.directory = directory;

          shell.descript = descript;
          shell.descriptJSON = descriptJSON;
          shell.config = config;

          shell.surfacesTxt = surfacesTxt;
          shell.surfaceDefTree = surfaceDefTree;

          return shell;
        }) ) ) );
}

// directoryからdescript.txtを探して descript
export function loadDescript(directory: Directory): Promise<{descript:Descript, descriptJSON: JSONLike, config:Config}> {
  const dir = directory;
  const name = Util.fastfind(Object.keys(dir), "descript.txt");
  let descript: Descript = {};
  let descriptJSON: JSONLike = {};
  if (name === "") {
    console.info("ShellModelLoader.loadDescript: descript.txt is not found");
  } else {
    descript = Util.parseDescript(Util.convert(dir[name]));
    Object.keys(descript).forEach((key)=>{
      let _key = key
        .replace(/^sakura\./, "char0.")
        .replace(/^kero\./, "char1.");
      Util.decolateJSONizeDescript<JSONLike, string>(descriptJSON, _key, descript[key]);
    });
  }
  // key-valueなdescriptをconfigへ変換
  return SCL.loadFromJSONLike(descriptJSON).then((config)=>{
    return {descript, descriptJSON, config};
  });
}

// surfaces.txtを読んでsurfacesTxtに反映
export function loadSurfacesTxt(directory: Directory): Promise<{ surfacesTxt: SY.SurfacesTxt, surfaceDefTree: SurfaceDefinitionTree }> {
  const filenames = Util.findSurfacesTxt(Object.keys(directory));
  if(filenames.length === 0){
    console.info("ShellModelLoader.loadSurfacesTxt: surfaces.txt is not found");
  }
  const cat_text = filenames.reduce((text, filename)=> text + Util.convert(directory[filename]), "");
  const surfacesTxt = SY.txt_to_data(cat_text, {compatible: 'ssp-lazy'});
  return STL.loadSurfaceDefinitionTreeFromsurfacesTxt2Yaml(surfacesTxt)
  .then((surfaceDefTree)=>{
    return { surfacesTxt, surfaceDefTree };
  });
}


// surfacetable.txtを読む予定
export function loadSurfaceTable(directory: Directory): Promise<void> {
  const surfacetable_name = Object.keys(directory).filter((name)=> /^surfacetable.*\.txt$/i.test(name))[0] || "";
  if(surfacetable_name === ""){
    console.info("ShellModelLoader.loadSurfaceTable", "surfacetable.txt is not found.");
  }else{
    const txt = Util.convert(directory[surfacetable_name]);
    console.info("ShellModelLoader.loadSurfaceTable", "surfacetable.txt is not supported yet.");
    // TODO
  }
  return Promise.resolve();
}

// directory から surface*.png をelement0として読み込んで surfaceTree に反映
export function loadSurfacePNG(directory: Directory, tree: SurfaceDefinitionTree): Promise<SurfaceDefinitionTree>{
  const surfaceTree = tree.surfaces;
  const surface_names = Object.keys(directory).filter((filename)=> /^surface(\d+)\.png$/i.test(filename));
  surface_names.forEach((filename)=>{
    const n = Number((/^surface(\d+)\.png$/i.exec(filename)||["","NaN"])[1]);
    if(!isFinite(n)){ return; }
    // 存在した
    if(!( surfaceTree[n] instanceof SurfaceDefinition) ){
      // surfaces.txtで未定義なら追加
      surfaceTree[n] = new SurfaceDefinition();
      surfaceTree[n].elements[0] = new SurfaceElement("base", filename);
    }else if( !(surfaceTree[n].elements[0] instanceof SurfaceElement) ){
      // surfaces.txtで定義済みだけどelement0ではない
      surfaceTree[n].elements[0] = new SurfaceElement("base", filename);
    }else{
      // surfaces.txtでelement0まで定義済み
      console.info("SurfaceModelLoader.loadSurfacePNG: file", filename, "is rejected. alternative uses", surfaceTree[n].elements);
    }
  });
  return Promise.resolve(tree);
}

