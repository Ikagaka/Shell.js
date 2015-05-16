// Generated by CoffeeScript 1.9.2
(function() {
  cuttlebone.SurfaceUtil = (function() {
    function SurfaceUtil(cnv1) {
      this.cnv = cnv1;
      this.ctx = this.cnv.getContext("2d");
    }

    SurfaceUtil.prototype.composeElements = function(elements) {
      var canvas, copyed, offsetX, offsetY, ref, type, x, y;
      if (elements.length === 0) {
        return;
      }
      ref = elements[0], canvas = ref.canvas, type = ref.type, x = ref.x, y = ref.y;
      offsetX = offsetY = 0;
      switch (type) {
        case "base":
          this.base(canvas, offsetX, offsetY);
          break;
        case "overlay":
          this.overlay(canvas, offsetX + x, offsetY + y);
          break;
        case "overlayfast":
          this.overlayfast(canvas, offsetX + x, offsetY + y);
          break;
        case "replace":
          this.replace(canvas, offsetX + x, offsetY + y);
          break;
        case "add":
          this.overlayfast(canvas, offsetX + x, offsetY + y);
          break;
        case "bind":
          this.overlayfast(canvas, offsetX + x, offsetY + y);
          break;
        case "interpolate":
          this.interpolate(canvas, offsetX + x, offsetY + y);
          break;
        case "move":
          offsetX = x;
          offsetY = y;
          copyed = SurfaceUtil.copy(this.cnv);
          this.base(copyed, offsetX, offsetY);
          break;
        default:
          console.error(elements[0]);
      }
      this.composeElements(elements.slice(1));
    };

    SurfaceUtil.prototype.base = function(part, x, y) {
      SurfaceUtil.clear(this.cnv);
      this.init(part, x, y);
    };

    SurfaceUtil.prototype.overlay = function(part, x, y) {
      this.ctx.globalCompositeOperation = "source-over";
      if (this.cnv.width < part.width || this.cnv.height < part.height) {
        this.base(part, x, y);
      } else {
        this.ctx.drawImage(part, x, y);
      }
    };

    SurfaceUtil.prototype.overlayfast = function(part, x, y) {
      this.ctx.globalCompositeOperation = "source-over";
      this.ctx.drawImage(part, x, y);
    };

    SurfaceUtil.prototype.interpolate = function(part, x, y) {
      this.ctx.globalCompositeOperation = "destination-over";
      this.ctx.drawImage(part, x, y);
    };

    SurfaceUtil.prototype.replace = function(part, x, y) {
      this.ctx.clearRect(x, y, part.width, part.height);
      this.overlayfast(part, x, y);
    };

    SurfaceUtil.prototype.init = function(cnv, x, y) {
      if (x == null) {
        x = 0;
      }
      if (y == null) {
        y = 0;
      }
      this.cnv.width = cnv.width;
      this.cnv.height = cnv.height;
      this.overlayfast(cnv, x, y);
    };

    SurfaceUtil.prototype.rendRegion = function(arg) {
      var bottom, center_x, center_y, coordinates, left, name, radius, right, top, type;
      type = arg.type, name = arg.name, left = arg.left, top = arg.top, right = arg.right, bottom = arg.bottom, coordinates = arg.coordinates, radius = arg.radius, center_x = arg.center_x, center_y = arg.center_y;
      this.ctx.strokeStyle = "#00FF00";
      switch (type) {
        case "rect":
          this.ctx.rect(left, top, right - left, bottom - top);
          break;
        case "ellipse":
          this.ctx.rect(left, top, right - left, bottom - top);
          break;
        case "circle":
          this.ctx.rect(left, top, right - left, bottom - top);
          break;
        case "polygon":
          this.ctx.rect(left, top, right - left, bottom - top);
      }
      this.ctx.stroke();
      this.ctx.font = "35px";
      this.ctx.strokeStyle = "white";
      this.ctx.strokeText(type + ":" + name, left + 5, top + 10);
      this.ctx.fillStyle = "black";
      this.ctx.fillText(type + ":" + name, left + 5, top + 10);
    };

    SurfaceUtil.pna = function(cnvA, cnvB) {
      var ctxA, ctxB, dataA, dataB, i, imgdataA, imgdataB;
      ctxA = cnvA.getContext("2d");
      ctxB = cnvB.getContext("2d");
      imgdataA = ctxA.getImageData(0, 0, cnvA.width, cnvA.height);
      imgdataB = ctxB.getImageData(0, 0, cnvB.width, cnvB.height);
      dataA = imgdataA.data;
      dataB = imgdataB.data;
      i = 0;
      while (i < dataA.length) {
        dataA[i + 3] = dataB[i];
        i += 4;
      }
      ctxA.putImageData(imgdataA, 0, 0);
      return cnvA;
    };

    SurfaceUtil.choice = function(ary) {
      return ary[Math.round(Math.random() * (ary.length - 1))];
    };

    SurfaceUtil.clear = function(cnv) {
      cnv.width = cnv.width;
    };

    SurfaceUtil.copy = function(cnv) {
      var copy, ctx;
      copy = document.createElement("canvas");
      ctx = copy.getContext("2d");
      copy.width = cnv.width;
      copy.height = cnv.height;
      ctx.drawImage(cnv, 0, 0);
      return copy;
    };

    SurfaceUtil.transImage = function(img) {
      var a, b, cnv, ctx, data, g, i, imgdata, r;
      cnv = SurfaceUtil.copy(img);
      ctx = cnv.getContext("2d");
      imgdata = ctx.getImageData(0, 0, img.width, img.height);
      data = imgdata.data;
      r = data[0], g = data[1], b = data[2], a = data[3];
      i = 0;
      if (a !== 0) {
        while (i < data.length) {
          if (r === data[i] && g === data[i + 1] && b === data[i + 2]) {
            data[i + 3] = 0;
          }
          i += 4;
        }
      }
      ctx.putImageData(imgdata, 0, 0);
      return cnv;
    };

    SurfaceUtil.loadImage = function(url, callback) {
      var img;
      img = new Image;
      img.src = url;
      img.addEventListener("load", function() {
        return callback(null, img);
      });
      img.addEventListener("error", function(ev) {
        console.error(ev);
        return callback(ev.error, null);
      });
    };

    return SurfaceUtil;

  })();

}).call(this);
