"use strict";

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

require("../typings/index.d.ts");
var SU = require("./SurfaceUtil");
/*
CacheCanvas型はサーフェスのロード状況を管理します。


*/

var Done = function Done() {
    _classCallCheck(this, Done);
};

exports.Done = Done;

var Yet = function Yet() {
    _classCallCheck(this, Yet);
};

exports.Yet = Yet;

var Cache = function Cache() {
    _classCallCheck(this, Cache);

    this.cnv = document.createElement("canvas");
};

exports.Cache = Cache;

var PNGWithoutPNA = function (_Cache) {
    _inherits(PNGWithoutPNA, _Cache);

    function PNGWithoutPNA(png) {
        _classCallCheck(this, PNGWithoutPNA);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(PNGWithoutPNA).call(this));

        _this.png = png;
        return _this;
    }

    return PNGWithoutPNA;
}(Cache);

exports.PNGWithoutPNA = PNGWithoutPNA;

var PNGWithPNA = function (_PNGWithoutPNA) {
    _inherits(PNGWithPNA, _PNGWithoutPNA);

    function PNGWithPNA(png, pna) {
        _classCallCheck(this, PNGWithPNA);

        var _this2 = _possibleConstructorReturn(this, Object.getPrototypeOf(PNGWithPNA).call(this, png));

        _this2.pna = pna;
        return _this2;
    }

    return PNGWithPNA;
}(PNGWithoutPNA);

exports.PNGWithPNA = PNGWithPNA;
function applyChromakey(cc) {
    return new Promise(function (resolve, reject) {
        resolve(cc);
        //reject("not impl yet");
    });
}
exports.applyChromakey = applyChromakey;
function getPNGImage(pngBuffer) {
    return SU.fetchImageFromArrayBuffer(pngBuffer).then(function (png) {
        return new PNGWithoutPNA(png);
    });
}
exports.getPNGImage = getPNGImage;
function getPNGAndPNAImage(pngBuffer, pnaBuffer) {
    return Promise.all([SU.fetchImageFromArrayBuffer(pngBuffer), SU.fetchImageFromArrayBuffer(pnaBuffer)]).then(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2);

        var png = _ref2[0];
        var pna = _ref2[1];
        return new PNGWithPNA(png, pna);
    });
}
exports.getPNGAndPNAImage = getPNGAndPNAImage;