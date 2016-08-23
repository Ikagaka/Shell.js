/*
 * shell/master/*** ディレクトリから shell モデルを構築する
 */
"use strict";
var SH = require("./ShellModel");
var SU = require("./SurfaceUtil");
var SCL = require("./ShellConfigLoader");
var ST = require("./SurfaceTree");
var STL = require("./SurfaceTreeLoader");
var SY = require("surfaces_txt2yaml");
function load(directory) {
    return loadDescript(directory)
        .then(function (_a) {
        var descript = _a.descript, descriptJSON = _a.descriptJSON, config = _a.config;
        return loadSurfacesTxt(directory)
            .then(function (_a) {
            var surfacesTxt = _a.surfacesTxt, surfaceDefTree = _a.surfaceDefTree;
            return loadSurfaceTable(directory)
                .then(function () {
                return loadSurfacePNG(directory, surfaceDefTree)
                    .then(function (surfaceDefTree) {
                    var shell = new SH.Shell();
                    shell.directory = directory;
                    shell.descript = descript;
                    shell.descriptJSON = descriptJSON;
                    shell.config = config;
                    shell.surfacesTxt = surfacesTxt;
                    shell.surfaceDefTree = surfaceDefTree;
                    return shell;
                });
            });
        });
    });
}
exports.load = load;
// directoryからdescript.txtを探して descript
function loadDescript(directory) {
    var dir = directory;
    var name = SU.fastfind(Object.keys(dir), "descript.txt");
    var descript = {};
    var descriptJSON = {};
    if (name === "") {
        console.info("ShellModelLoader.loadDescript: descript.txt is not found");
    }
    else {
        descript = SU.parseDescript(SU.convert(dir[name]));
        Object.keys(descript).forEach(function (key) {
            var _key = key
                .replace(/^sakura\./, "char0.")
                .replace(/^kero\./, "char1.");
            SU.decolateJSONizeDescript(descriptJSON, _key, descript[key]);
        });
    }
    // key-valueなdescriptをconfigへ変換
    return SCL.loadFromJSONLike(descriptJSON).then(function (config) {
        return { descript: descript, descriptJSON: descriptJSON, config: config };
    });
}
exports.loadDescript = loadDescript;
// surfaces.txtを読んでsurfacesTxtに反映
function loadSurfacesTxt(directory) {
    var filenames = SU.findSurfacesTxt(Object.keys(directory));
    if (filenames.length === 0) {
        console.info("ShellModelLoader.loadSurfacesTxt: surfaces.txt is not found");
    }
    var cat_text = filenames.reduce(function (text, filename) { return text + SU.convert(directory[filename]); }, "");
    var surfacesTxt = SY.txt_to_data(cat_text, { compatible: 'ssp-lazy' });
    return STL.loadSurfaceDefinitionTreeFromsurfacesTxt2Yaml(surfacesTxt)
        .then(function (surfaceDefTree) {
        return { surfacesTxt: surfacesTxt, surfaceDefTree: surfaceDefTree };
    });
}
exports.loadSurfacesTxt = loadSurfacesTxt;
// surfacetable.txtを読む予定
function loadSurfaceTable(directory) {
    var surfacetable_name = Object.keys(directory).filter(function (name) { return /^surfacetable.*\.txt$/i.test(name); })[0] || "";
    if (surfacetable_name === "") {
        console.info("ShellModelLoader.loadSurfaceTable", "surfacetable.txt is not found.");
    }
    else {
        var txt = SU.convert(directory[surfacetable_name]);
        console.info("ShellModelLoader.loadSurfaceTable", "surfacetable.txt is not supported yet.");
    }
    return Promise.resolve();
}
exports.loadSurfaceTable = loadSurfaceTable;
// directory から surface*.png をelement0として読み込んで surfaceTree に反映
function loadSurfacePNG(directory, tree) {
    var surfaceTree = tree.surfaces;
    var surface_names = Object.keys(directory).filter(function (filename) { return /^surface(\d+)\.png$/i.test(filename); });
    surface_names.forEach(function (filename) {
        var n = Number((/^surface(\d+)\.png$/i.exec(filename) || ["", "NaN"])[1]);
        if (!isFinite(n)) {
            return;
        }
        // 存在した
        if (!(surfaceTree[n] instanceof ST.SurfaceDefinition)) {
            // surfaces.txtで未定義なら追加
            surfaceTree[n] = new ST.SurfaceDefinition();
            surfaceTree[n].elements[0] = new ST.SurfaceElement("base", filename);
        }
        else if (!(surfaceTree[n].elements[0] instanceof ST.SurfaceElement)) {
            // surfaces.txtで定義済みだけどelement0ではない
            surfaceTree[n].elements[0] = new ST.SurfaceElement("base", filename);
        }
        else {
            // surfaces.txtでelement0まで定義済み
            console.info("SurfaceModelLoader.loadSurfacePNG: file", filename, "is rejected. alternative uses", surfaceTree[n].elements);
        }
    });
    return Promise.resolve(tree);
}
exports.loadSurfacePNG = loadSurfacePNG;
