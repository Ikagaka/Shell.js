"use strict";
const SH = require("./Shell");
const SU = require("./SurfaceUtil");
const SCL = require("./ShellConfigLoader");
const ST = require("./SurfaceTree");
const STL = require("./SurfaceTreeLoader");
const SY = require("surfaces_txt2yaml");
function load(directory, shell = new SH.Shell(directory)) {
    return Promise.resolve(shell)
        .then(() => loadDescript(directory))
        .then(({ descript, descriptJSON, config }) => {
        shell.descript = descript;
        shell.descriptJSON = descriptJSON;
        shell.config = config;
    })
        .then(() => loadSurfacesTxt(directory))
        .then(({ surfacesTxt, surfaceDefTree }) => {
        shell.surfacesTxt = surfacesTxt;
        shell.surfaceDefTree = surfaceDefTree;
    })
        .then(() => loadSurfaceTable(directory))
        .then(() => loadSurfacePNG(directory, shell.surfaceDefTree))
        .then((surfaceDefTree) => {
        shell.surfaceDefTree = surfaceDefTree;
    })
        .then(() => shell)
        .catch((err) => {
        console.error("ShellLoader.load > ", err);
        return Promise.reject(err);
    });
}
exports.load = load;
// directoryからdescript.txtを探して descript
function loadDescript(directory) {
    const dir = directory;
    const name = SU.fastfind(Object.keys(dir), "descript.txt");
    let descript = {};
    let descriptJSON = {};
    if (name === "") {
        console.info("ShellLoader.loadDescript: descript.txt is not found");
    }
    else {
        let descript = SU.parseDescript(SU.convert(dir[name]));
        let json = {};
        Object.keys(descript).forEach((key) => {
            let _key = key
                .replace(/^sakura\./, "char0.")
                .replace(/^kero\./, "char1.");
            SU.decolateJSONizeDescript(json, _key, descript[key]);
        });
        let descriptJSON = json;
    }
    // key-valueなdescriptをconfigへ変換
    return SCL.loadFromJSONLike(descriptJSON).then((config) => {
        return { descript, descriptJSON, config };
    });
}
exports.loadDescript = loadDescript;
// surfaces.txtを読んでsurfacesTxtに反映
function loadSurfacesTxt(directory) {
    const filenames = SU.findSurfacesTxt(Object.keys(directory));
    if (filenames.length === 0) {
        console.info("ShellLoader.loadSurfacesTxt: surfaces.txt is not found");
    }
    const cat_text = filenames.reduce((text, filename) => text + SU.convert(directory[filename]), "");
    const surfacesTxt = SY.txt_to_data(cat_text, { compatible: 'ssp-lazy' });
    return STL.loadSurfaceDefinitionTreeFromsurfacesTxt2Yaml(surfacesTxt)
        .then((surfaceDefTree) => {
        return { surfacesTxt, surfaceDefTree };
    });
}
exports.loadSurfacesTxt = loadSurfacesTxt;
// surfacetable.txtを読む予定
function loadSurfaceTable(directory) {
    const surfacetable_name = Object.keys(directory).filter((name) => /^surfacetable.*\.txt$/i.test(name))[0] || "";
    if (surfacetable_name === "") {
        console.info("ShellLoader.loadSurfaceTable", "surfacetable.txt is not found.");
    }
    else {
        const txt = SU.convert(directory[surfacetable_name]);
        console.info("ShellLoader.loadSurfaceTable", "surfacetable.txt is not supported yet.");
    }
    return Promise.resolve();
}
exports.loadSurfaceTable = loadSurfaceTable;
// directory から surface*.png をelement0として読み込んで surfaceTree に反映
function loadSurfacePNG(directory, tree) {
    const surfaceTree = tree.surfaces;
    const surface_names = Object.keys(directory).filter((filename) => /^surface(\d+)\.png$/i.test(filename));
    surface_names.forEach((filename) => {
        const n = Number((/^surface(\d+)\.png$/i.exec(filename) || ["", "NaN"])[1]);
        if (!isFinite(n)) {
            return;
        }
        // 存在した
        if (surfaceTree[n] == null) {
            // surfaces.txtで未定義なら追加
            surfaceTree[n] = new ST.SurfaceDefinition();
            surfaceTree[n].elements[0] = new ST.SurfaceElement("base", filename);
        }
        else if (surfaceTree[n].elements[0] != null) {
            // surfaces.txtで定義済みだけどelement0ではない
            surfaceTree[n].elements[0] = new ST.SurfaceElement("base", filename);
        }
        else {
        }
    });
    return Promise.resolve(tree);
}
exports.loadSurfacePNG = loadSurfacePNG;