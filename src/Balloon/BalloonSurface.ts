

import * as SurfaceUtil from "../Util/index";
import {BAL, Descript, Surface} from "./Interfaces";
import $ = require("jquery");
import {EventEmitter} from "events";

export type NULL = null;
export default class BalloonSurface extends EventEmitter {
  element: HTMLDivElement;
  scopeId: number;
  balloonId: number;
  balloon: any;// たぶん設定とか
  type: "sakura" | "kero";
  isBalloonLeft: boolean;
  descript: Descript;
  destructed: boolean;
  destructors: Function[];
  insertPoint: JQuery;
  originalInsertPoint: JQuery;
  width: number;
  height: number;
  $blimp: JQuery;
  $blimpCanvas: JQuery;
  $blimpText: JQuery;
  _text_style: { [cssprop: string]: string };
  _choice_style: { [cssprop: string]: string };
  _choice_notselect_style: { [cssprop: string]: string };
  _anchor_style: { [cssprop: string]: string };
  _anchor_notselect_style: { [cssprop: string]: string };
  _current_text_style: { [cssprop: string]: string };
  _current_choice_style: { [cssprop: string]: string };
  _current_choice_notselect_style: { [cssprop: string]: string };
  _current_anchor_style: { [cssprop: string]: string };
  _current_anchor_notselect_style: { [cssprop: string]: string };
  currentSurface: Surface;

  constructor(element: HTMLDivElement, scopeId: number, balloonId: number, balloon: any){
    super();
    this.element = element;
    this.scopeId = scopeId;
    this.balloonId = balloonId;
    this.balloon = balloon;
    this.type = this.scopeId === 0 ? "sakura" : "kero";
    this.isBalloonLeft = true;
    balloonId = this.balloonId
    if (! this.isBalloonLeft){
      // バルーンが右向きならバルーンIDは+1
      balloonId++;
    }
    // バルーンごとに固有のdescript
    var a:any, b:any, c:any;
    if((a = this.balloon.balloons[this.type]) != null && (b = a[balloonId]) != null && (c = b.descript) != null){
      this.descript = c;
    }else{
      this.descript = {}
    }
    this.destructed = false;
    this.destructors = [];
    this.insertPoint = null;
    this.width = 0;
    this.height = 0;
    this.destructors = [];
    this.$blimp = null;
    this.$blimpCanvas = null;
    this.$blimpText = null;

    this.initDOMStructure()
    this.initEventListener()
    this.initStyleFromDescript()

    this.render()
  }

  private initDOMStructure(): void{
    this.$blimp = $(this.element).addClass("blimp");
    this.$blimpCanvas = $("<canvas width='0' height='0' />").addClass("blimpCanvas");
    this.$blimpText = $("<div />").addClass("blimpText");
    this.$blimp.append(this.$blimpCanvas);
    this.$blimp.append(this.$blimpText);
    this.$blimp.css({
      position: "absolute",
      top: "0px",
      left: "0px",
      "pointer-events": "auto"
    });
    this.$blimpCanvas.css({
      position: "absolute",
      top: "0px",
      left: "0px"
    });
    this.$blimpText.css({
      position: "absolute",
      top: "0px",
      left: "0px",
      "overflow-y": "scroll",
      "white-space": "pre-wrap",
      "word-wrap": "break-all"
    });
    $("<style scoepd />").text(`
    .blimpText a {
      cursor: pointer;
    }
    @keyframes blink {
      75% { opacity: 0.0; }
    }
    .blimpText .blink {
      animation: blink 1s step-end infinite;
    }
    `).appendTo(this.$blimp);
    this.insertPoint = this.$blimpText
    return
  }

  private initEventListener(): void{
    let mouselistener = (ev)=>{
      let custom = {
        type: ev.type,
        scopeId: this.scopeId,
        balloonId: this.balloonId,
        event: ev
      };
      this.balloon.emit("mouse", custom);
    };
    this.$blimp.on("click", mouselistener);
    this.$blimp.on("dblclick", mouselistener);
    this.$blimp.on("mousemove", mouselistener);
    this.$blimp.on("mousedown", mouselistener);
    this.$blimp.on("mouseup", mouselistener);
    let onchoiceclick = (ev)=>{
      let dataset = <{[a:string]:string}>ev.target["dataset"];
      let event = {
        type: "choiceselect",
        id:   dataset["id"],
        args: [],
        text: ev.target.textContent
      }
      let argc = Number(dataset["argc"]);
      for(let i=0; i<=argc; i++){
        event.args.push(dataset["argv"+i]);
      }
      this.balloon.emit("select", event);
    }
    this.$blimp.on("click", ".ikagaka-choice", onchoiceclick);
    let onanchorclick = (ev:JQueryEventObject)=>{
      let dataset = <{[a:string]:string}>ev.target["dataset"];
      let event = {
        type: "anchorselect",
        id:   dataset["id"],
        args: [],
        text: ev.target.textContent
      }
      let argc = Number(dataset["argc"])
      for(let i=0; i<=argc; i++){
        event.args.push(dataset["argv"+i]);
      }
      this.balloon.emit("select", event);
    }
    this.$blimp.on("click", ".ikagaka-anchor", onanchorclick);
    this.destructors.push(()=>{
      this.$blimp.off("click", mouselistener);
      this.$blimp.off("dblclick", mouselistener);
      this.$blimp.off("click", ".ikagaka-choice", onchoiceclick);
      this.$blimp.off("click", ".ikagaka-anchor", onanchorclick);
    })
    return
  }

  private initStyleFromDescript(): void{
    let descript = <{[a:string]:string}>this.balloon.descript;
    this._text_style = {
      "cursor":          descript["cursor"] || '',
      "font.name":      (descript["font.name"] || "MS Gothic").split(/,/).map((name)=> '"'+name+'"').join(','),
      "font.height":    (descript["font.height"] || "12") + "px",
      "font.color":       this._getFontColor(descript["font.color.r"], descript["font.color.g"], descript["font.color.b"]),
      "font.shadowcolor": this._getFontColor(descript["font.shadowcolor.r"], descript["font.shadowcolor.g"], descript["font.shadowcolor.b"], true),
      "font.bold":      descript["font.bold"],
      "font.italic":    descript["font.italic"],
      "font.strike":    descript["font.strike"],
      "font.underline": descript["font.underline"]
    };
    let clickable_element_style = (prefix:string, style_default:string|NULL, descript:{[a:string]:string}, can_ignore=false):{[a:string]:string}=>{
      return {
        "style":       {square: true, underline: true, 'square+underline': true, none: true}[descript[`${prefix}.style`]] ? descript[`${prefix}.style`] : style_default,
        "font.color":  this._getFontColor(descript[`${prefix}.font.color.`],   descript[`${prefix}.font.color.g`],  descript[`${prefix}.font.color.b`],  can_ignore),
        "pen.color":   this._getFontColor(descript[`${prefix}.pen.color.r`],   descript[`${prefix}.pen.color.g`],   descript[`${prefix}.pen.color.b`],   can_ignore),
        "brush.color": this._getFontColor(descript[`${prefix}.brush.color.r`], descript[`${prefix}.brush.color.g`], descript[`${prefix}.brush.color.b`], can_ignore)
      };
    };
    this._choice_style =           clickable_element_style("cursor",           "square",    descript);
    this._choice_notselect_style = clickable_element_style("cursor.notselect", undefined,   descript, true);
    this._anchor_style =           clickable_element_style("anchor",           "underline", descript);
    this._anchor_notselect_style = clickable_element_style("anchor.notselect", undefined,   descript, true);
    this.$blimpText.css(this._blimpTextCSS(this._text_style));
    this._initializeCurrentStyle();
    return;
  }

  private _blimpTextCSS(styles: { [cssprop: string]: string }): { [cssprop: string]: string }{
    let css = <{[a:string]:string}>{};
    css["cursor"] = styles["cursor"]
    css["font-family"] = styles["font.name"]
    css["font-size"] = styles["font.height"]
    css["color"] = styles["font.color"]
    css["background"] = "none"
    css["outline"] = "none"
    css["border"] = "none"
    css["text-shadow"] = styles["font.shadowcolor"] ? `1px 1px 0 ${styles["font.shadowcolor"]}` : "none";
    css["font-weight"] = styles["font.bold"] ? "bold" : "normal";
    css["font-style"] = styles["font.italic"] ? "italic" : "normal";
    let text_decoration = [];
    if (styles["font.strike"]){    text_decoration.push('line-through'); }
    if (styles["font.underline"]){ text_decoration.push('underline');    }
    css["text-decoration"] = text_decoration.length ? text_decoration.join(' ') : "none";
    css["line-height"] = "1.2em";
    return css;
  }

  private _blimpClickableTextCSS(styles:{[a:string]:string}, default_styles:{[a:string]:string}={}): {base: { [cssprop: string]: string },over: { [cssprop: string]: string }}{
    let color = styles["font.color"] || default_styles["font.color"];
    let outline = styles["pen.color"]         ? `solid 1px ${styles["pen.color"]}`
                : default_styles["pen.color"] ? `solid 1px ${default_styles["pen.color"]}`
                :                               `solid 1px ${default_styles["font.color"]}`;
    let background = styles["brush.color"] || default_styles["brush.color"] || default_styles["font.color"];
    let border_bottom = styles["pen.color"]         ? `solid 1px ${styles["pen.color"]}`
                      : default_styles["pen.color"] ? `solid 1px ${default_styles["pen.color"]}` 
                      :                               `solid 1px ${default_styles["font.color"]}`;
    switch(styles["style"]){
      case "square": return {
        base: { color: color },
        over: {
          outline: outline,
          background: background,
          "border-bottom": "none" } };
      case "underline": return {
        base: { color: color },
        over: {
          outline: "none",
          background: "none",
          'border-bottom': border_bottom } };
      case "square+underline": return {
        base: { color: color },
        over: {
          outline: outline,
          background: background,
          'border-bottom': border_bottom } };
      case "none": return {
        base: { color: color },
        over: {
          outline: "none",
          background: "none",
          "border-bottom": "none" } };
      default : return {
        base: {},
        over: {} };
    }
  }

  private _initializeCurrentStyle(){
    this._current_text_style = {};
    for (let name in this._text_style){
      let value = this._text_style[name];
      this._current_text_style[name] = value;
    }
    this._current_choice_style = {};
    for(let name in this._choice_style){
      let value = this._choice_style[name];
      this._current_choice_style[name] = value;
    }
    this._current_choice_notselect_style = {};
    for(let name in this._choice_notselect_style){
      let value = this._choice_notselect_style[name];
      this._current_choice_notselect_style[name] = value;
    }
    this._current_anchor_style = {};
    for(let name in this._anchor_style){
      let value = this._anchor_style[name];
      this._current_anchor_style[name] = value;
    }
    this._current_anchor_notselect_style = {};
    for(let name in this._anchor_notselect_style){
      let value = this._anchor_notselect_style[name];
      this._current_anchor_notselect_style[name] = value;
    }
    return;
  }

  private _getFontColor(r:string,g:string,b:string,can_ignore=false): string{
    let rc = Number(r != null ? r.replace(/%$/,'') : Number.NaN);
    let gc = Number(g != null ? g.replace(/%$/,'') : Number.NaN);
    let bc = Number(b != null ? b.replace(/%$/,'') : Number.NaN);
    if ((isNaN(rc) || rc < 0) && (isNaN(gc) || gc < 0) && (isNaN(bc) || bc < 0) ) {
      if (can_ignore){
        return "";
      }else{
        return "rgb(0,0,0)";
      }
    }else{
      return `rgb(${r},${g},${b})`;
    }
  }

  public location(x:string, y:string): void{
    let re = /^(@)?(-?\d*\.?\d*e?\d*)(em|%)?$/;
    let toparam = (r:string):{relative:boolean,value:string}=>{
      r = r + ""
      if(!r.length){
        return { relative: true, value: "0em"};
      }
      let rp:string[] = r.match(re);
      if(rp == null) { return void 0; } // avoid "Not all code paths return a value"
      if(isNaN(Number(rp[2]))){ return void 0; } // avoid "Not all code paths return a value"
      if(rp[3] == '%'){
        var value = Number(rp[2]) / 100;
        var unit = 'em';
      }else{
        var value = Number(rp[2]);
        var unit = rp[3] || 'px';
      }
      return {
        relative: !!rp[1],
        value: value + unit
      };
    };
    let xp = toparam(x);
    let yp = toparam(y);
    if(!( xp != null && yp !=null)){ return; }
    if(xp.relative || yp.relative){
      let $imp_position_checker = $('<span>.</span>');
      this.insertPoint.append($imp_position_checker);
      let offset = $imp_position_checker.offset();
      let baseoffset = this.$blimpText.offset();
      var offsetx = offset.left - baseoffset.left;
      var offsety = offset.top - baseoffset.top + this.$blimpText.scrollTop();
      $imp_position_checker.remove();
    }
    if (! xp.relative ){ var offsetx = 0; }
    if (! yp.relative ){ var offsety = 0; }
    let $newimp_container_top = $('<div />')
      .addClass("newimp_container_top")
      .css({'position': 'absolute', 'pointer-events': 'none', 'top': yp.value});
    let $newimp_container = $('<div />')
      .addClass("newimp_container")
      .css({'position': 'absolute', 'pointer-events': 'none', 'text-indent': offsetx + 'px', 'top': offsety + 'px', 'width': this.$blimpText[0].clientWidth});
    let $newimp = $('<span />')
      .css({'pointer-events': 'auto', 'margin-left': xp.value});
    this.insertPoint = $newimp.appendTo(
      $newimp_container.appendTo(
        $newimp_container_top.appendTo(
          this.$blimpText)));
    this.insertPoint.css(this._blimpTextCSS(this._current_text_style));
    return;
  }

  public destructor(): void{
    this.destructor = ()=> console.warn("this blimp was already destructed", this)
    this.destructors.forEach((fn)=> fn());
    this.destructed = true;
    this.$blimp.removeClass("blimp");
    this.$blimp.children().remove();
    this.balloon = null;
    return;
  }

  public render(): void{
    // canvasに指定の背景画像を描画
    let balloonId = this.balloonId;
    if(!this.isBalloonLeft){ balloonId++ };
    let baseCanvas = this.balloon.balloons[this.type][balloonId].canvas;
    this.descript  = this.balloon.balloons[this.type][balloonId].descript || {};
    let cnv = <HTMLCanvasElement>this.$blimpCanvas[0];
    SurfaceUtil.fastcopy(baseCanvas, cnv.getContext("2d"));
    // 大きさ調整
    this.$blimp.width(this.width = cnv.width);
    this.$blimp.height(this.height = cnv.height);
    // テキスト領域を計算
    let descript = this.descript;
    let t = descript["origin.y"]         || descript["validrect.top"] || "10";
    let r = descript["validrect.right"]  || "10";
    let b = descript["validrect.bottom"] || "10";
    let l = descript["origin.x"]         || descript["validrect.left"] || "10";
    let w = cnv.width;
    let h = cnv.height;
    this.$blimpText.css({
      top: t+"px",
      left: l+"px",
      width: w-(Number(l)+Number(r))+"px",
      height: h-(Number(t)-Number(b))+"px"
    })
    return;
  }

  public left(): void{
    this.isBalloonLeft = true;
    this.render();
  }

  public right(): void{
    this.isBalloonLeft = false;
    this.render();
  }

  public surface(balloonId:number): void{
    // * http://ssp.shillest.net/ukadoc/manual/manual_balloon.html
    // > 偶数番のIDは左向きのバルーン、奇数番のIDは右向きのバルーンとして、二つセットになる
    balloonId - balloonId%2;
    if(!this.isBalloonLeft){
      balloonId++;
    }
    this.balloonId = balloonId;
    this.render();
  }

  public anchorBegin(id:string, ...args:string[]): void{
    this.$blimpText.find(".blink").hide();
    this.$blimp.show();
    let _id = $(document.createElement("div")).text(id).html();
    let $a = $("<a />").addClass("ikagaka-anchor");
    let text_css = this._blimpTextCSS(this._current_text_style);
    let anchor_css = this._blimpClickableTextCSS(this._current_anchor_style);
    let anchor_notselect_css = this._blimpClickableTextCSS(this._current_anchor_notselect_style, this._current_anchor_style);
    $a.css(text_css).css(anchor_css.base).css(anchor_notselect_css.base).css(anchor_notselect_css.over);
    $a.mouseover(()=> $a.css(anchor_css.over));
    $a.mouseout(()=> $a.css(text_css).css(anchor_css.base).css(anchor_notselect_css.base).css(anchor_notselect_css.over));
    $a.attr("data-id", _id);
    $a.attr("data-argc", args.length);
    for(let argv in args){
      let index = args[argv];
      $a.attr("data-argv"+index, argv);
    }
    this.originalInsertPoint = this.insertPoint;
    this.insertPoint = $a.appendTo(this.insertPoint);
    return;
  }

  public anchorEnd(): void{
    this.insertPoint = this.originalInsertPoint;
    return;
  }

  public choice(text:string, id:string, ...args:string[]): void{
    this.$blimpText.find(".blink").hide();
    this.$blimp.show()
    let _text = $(document.createElement("div")).text(text).html();
    let _id = $(document.createElement("div")).text(id).html();
    let $a = $("<a />").addClass("ikagaka-choice")
    let text_css = this._blimpTextCSS(this._current_text_style);
    let choice_css = this._blimpClickableTextCSS(this._current_choice_style);
    let choice_notselect_css = this._blimpClickableTextCSS(this._current_choice_notselect_style, this._current_text_style);
    $a.css(text_css).css(choice_notselect_css.base).css(choice_notselect_css.over);
    $a.mouseover(()=> $a.css(choice_css.base).css(choice_css.over));
    $a.mouseout(()=> $a.css(text_css).css(choice_notselect_css.base).css(choice_notselect_css.over));
    $a.html(_text);
    $a.attr("data-id", _id);
    $a.attr("data-argc", args.length);
    for(let argv in args){
      let index = args[argv];
      $a.attr(`data-argv${index}`, argv);
    }
    $a.appendTo(this.insertPoint);
    return;
  }

  public choiceBegin(id:string, ...args:string[]): void{
    this.$blimpText.find(".blink").hide();
    this.$blimp.show();
    let _id = $(document.createElement("div")).text(id).html();
    let $a = $("<a />").addClass("ikagaka-choice");
    let text_css = this._blimpTextCSS(this._current_text_style);
    let choice_css = this._blimpClickableTextCSS(this._current_choice_style);
    let choice_notselect_css = this._blimpClickableTextCSS(this._current_choice_notselect_style, this._current_text_style);
    $a.css(text_css).css(choice_notselect_css.base).css(choice_notselect_css.over);
    $a.mouseover(()=> $a.css(choice_css.base).css(choice_css.over));
    $a.mouseout(()=> $a.css(text_css).css(choice_notselect_css.base).css(choice_notselect_css.over));
    $a.attr("data-id", _id);
    $a.attr("data-argc", args.length);
    for(let argv in args){
      let index = args[argv];
      $a.attr("data-argv"+index, argv);
    }
    this.originalInsertPoint = this.insertPoint;
    this.insertPoint = $a.appendTo(this.insertPoint);
    return;
  }

  public choiceEnd(): void{
    this.insertPoint = this.originalInsertPoint;
    return;
  }

  public talk(text:string): void{
    this.$blimpText.find(".blink").hide();
    let _text = $(document.createElement("div")).text(text).html();
    if(!!this.currentSurface){
      this.emit("talk");
      //this.currentSurface.talk();
    }
    this.$blimp.show();
    this.insertPoint.append(_text);
    this.$blimpText[0].scrollTop = 999;
    return;
  }

  public talkraw(text:string): void{
    this.$blimpText.find(".blink").hide();
    if(!!this.currentSurface){
      this.emit("talk");
      //this.currentSurface.talk();
    }
    this.$blimp.show();
    this.insertPoint.append(text);
    this.$blimpText[0].scrollTop = 999;
    return;
  }

  public marker(): void{
    this.$blimpText.find(".blink").hide();
    let _text = $(document.createElement("div")).text("・").html();
    this.$blimp.show();
    this.insertPoint.append(_text);
    this.$blimpText[0].scrollTop = 999;
    return;
  }

  public clear(): void{
    this.$blimpText.html("");
    this.insertPoint = this.$blimpText;
    this._initializeCurrentStyle();
    return;
  }

  public br(ratio:number): void{
    if(ratio!=null){
      this.location('0', '@' + ratio + 'em');
    }else{
      this.insertPoint.append("<br />");
    }
  }

  public showWait(): void{
    this.insertPoint.append("<br /><br />").append("<div class='blink'>▼</div>");
    this.$blimpText[0].scrollTop = 999;
    return;
  }

  public font(name:string, ...values): void{
    let value = values[0];
    let treat_bool = (name, value)=>{
      if(value === 'default'){
        this._current_text_style[`font.${name}`] = this._text_style[`font.${name}`];
      }else{
        this._current_text_style[`font.${name}`] = ""+!((value === 'false') || ((value - 0) === 0));
      }
    };
    let treat_clickable_styles = (treat_name:string, name:string, value:string, values:string[], _current_style:{[a:string]:string}, _style:{[a:string]:string})=>{
      switch(name){
        case `${treat_name}style`:
          if(value === 'default'){
            _current_style["style"] = _style["style"];
          }else{
            _current_style["style"] = value;
          }
          break;
        case `${treat_name}fontcolor`:
          if (value === 'default'){
            _current_style["font.color"] = _style["font.color"];
          }else if (values[0]!=null && values[1]!=null && values[2]!=null){
            _current_style["font.color"] = this._getFontColor(values[0], values[1], values[2]);
          }else{
            _current_style["font.color"] = value;
          }
          break;
        case `${treat_name}pencolor`:
          if (value === 'default'){
            _current_style["pen.color"] = _style["pen.color"];
          }else if (values[0]!=null && values[1]!=null && values[2]!=null){
            _current_style["pen.color"] = this._getFontColor/*_getpenColor が存在しない！！！ので代用*/(values[0], values[1], values[2]);
          }else{
            _current_style["pen.color"] = value;
          }
          break;
        case `${treat_name}color`, `${treat_name}brushcolor`:
          if (value === 'default'){
            _current_style["brush.color"] = _style["brush.color"];
          }else if (values[0]!=null && values[1]!=null && values[2]!=null){
            _current_style["brush.color"] = this._getFontColor(values[0], values[1], values[2]);
          }else{
            _current_style["brush.color"] = value;
          }
          break;
      }
    };
    switch(name){
      case 'name':
        var is_text_style = true;
        this._current_text_style["font.name"] = values.map((name)=> '"'+name+'"').join(',');
        break;
      case 'height':
        var is_text_style = true;
        if (value === 'default'){
          this._current_text_style["font.height"] = this._text_style["font.height"];
        }else if( /^[+-]/.test(value)){
          let $size_checker = $('<span />').text('I').css({position: 'absolute', visibility: 'hidden', 'width': '1em', 'font-size': '1em', padding: 0, 'line-height': '1em'});
          this.insertPoint.append($size_checker);
          let size = $size_checker[0].clientHeight;
          $size_checker.remove();
          this._current_text_style["font.height"] = (Number(size) + Number(value)) + 'px';
        }else if(! isNaN(Number(value))){
          this._current_text_style["font.height"] = value + 'px'
        }else{
          this._current_text_style["font.height"] = value;
        }
        break;
      case 'color':
        var is_text_style = true;
        if (value === 'default'){
          this._current_text_style["font.color"] = this._text_style["font.color"];
        }else if(values[0]!=null && values[1]!=null && values[2]!=null){
          this._current_text_style["font.color"] = this._getFontColor(values[0], values[1], values[2]);
        }else{
          this._current_text_style["font.color"] = value;
        }
        break;
      case 'shadowcolor':
        var is_text_style = true;
        if (value === 'default'){
          this._current_text_style["font.shadowcolor"] = this._text_style["font.shadowcolor"];
        }else if (value === 'none'){
          this._current_text_style["font.shadowcolor"] = undefined;
        }else if(values[0]!=null && values[1]!=null && values[2]!=null){
          this._current_text_style["font.shadowcolor"] = this._getFontColor(values[0], values[1], values[2]);
        }else{
          this._current_text_style["font.shadowcolor"] = value;
        }
        break;
      case 'bold':
        var is_text_style = true;
        treat_bool('bold', value);
        break;
      case 'italic':
        var is_text_style = true;
        treat_bool('italic', value);
        break;
      case 'strike':
        var is_text_style = true;
        treat_bool('strike', value);
        break;
      case 'underline':
        var is_text_style = true;
        treat_bool('underline', value);
        break;
      case 'default':
        var is_text_style = true;
        this._initializeCurrentStyle();
        break;
      case 'cursorstyle', 'cursorfontcolor', 'cursorpencolor', 'cursorcolor', 'cursorbrushcolor':
        treat_clickable_styles('cursor', name, value, values, this._current_choice_style, this._choice_style);
        break;
      case 'anchorstyle', 'anchorfontcolor', 'anchorpencolor', 'anchorcolor', 'anchorbrushcolor':
        treat_clickable_styles('anchor', name, value, values, this._current_anchor_style, this._anchor_style);
        break;
      case 'cursornotselectstyle', 'cursornotselectfontcolor', 'cursornotselectpencolor', 'cursornotselectcolor', 'cursornotselectbrushcolor':
        treat_clickable_styles('cursornotselect', name, value, values, this._current_choice_notselect_style, this._choice_notselect_style);
        break;
      case 'anchornotselectstyle', 'anchornotselectfontcolor', 'anchornotselectpencolor', 'anchornotselectcolor', 'anchornotselectbrushcolor':
        treat_clickable_styles('anchornotselect', name, value, values, this._current_anchor_notselect_style, this._anchor_notselect_style);
        break;
    }
    if (is_text_style){
      let $newimp = $('<span />');
      this.insertPoint = $newimp.appendTo(this.insertPoint);
      this.insertPoint.css(this._blimpTextCSS(this._current_text_style));
    }
    return;
  }
}