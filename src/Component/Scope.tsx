import * as Util from "../Util/index";

import {Canvas} from "../Model/Canvas"
import * as MS from "../Model/Scope";
import {Shell} from "../Model/Shell";

import {MoveEvent} from "../State/Surface";
import * as SS from "../State/Scope";

import {Renderer} from "../Renderer/Renderer";
import {SurfacePatternRenderer} from "../Renderer/Pattern";

import {Layer, LayerSet, LayerProps} from "./Layer";

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import $ = require("jquery");
import {EventEmitter} from "events";


export interface ScopeProps extends React.Props<Scope>{
  scopeState: SS.ScopeState;
}
export interface ScopeState {}
export class Scope extends React.Component<ScopeProps, ScopeState> {
  constructor(props: ScopeProps) {
    super(props);
    const {scopeState} = this.props;
    const {surfaceState} = scopeState;
    surfaceState.on("onMove", (ev: MoveEvent)=>{
      this.setState({});
    });
  }
  draw() {
    const {scopeState} = this.props;
    const {scope} = scopeState;
    const canvas = this.refs["surface"] as HTMLCanvasElement;
    // このタイミングでこの canvas を　patternrenderer に attach して draw して欲しい
    // patRndr.attachCanvas(canvas); して
    scopeState.emit("onSurfaceDraw", { type: "onSurfaceDraw", canvas, scope });
  }
  componentDidMount(){
    this.draw();
  }
  componentDidUpdate() {
    this.draw();
  }
  render(){
    const {scopeState} = this.props;
    const {shell, scope, position, alignmenttodesktop, basepos, surface} = scopeState;
    const {scopeId, surfaceId} = scope;
    const {move} = surface;
    const {baseWidth, baseHeight, basePosX, basePosY} = surface.srfCnv;
    const {x,y} = position;
    const config = shell;
    const surfaceNode = shell.surfaceDefTree.surfaces[scopeId]
    const s: LayerProps = {
      width: baseWidth, height: baseHeight,
      basisX: "left",
      basisY: "top",
      x, y
    };
    s.x -= basepos.x;
    s.y -= basepos.y;
    switch (alignmenttodesktop){
      case "top": s.y=0; break;
      case "bottom": s.basisY="bottom"; s.y=0; break;
      case "right": s.basisX="right"; s.x=0; break;
      case "left": s.basisX="left"; s.x=0; break;
      case "free": break;
    }
    const b: LayerProps = {
      width: 200, height: 100,
      basisX: "left", basisY: "top",
      x: 0, y: 0
    };
    switch (b.basisX){
      case "left":  b.x -= b.width; break;
      case "right": b.x += b.width; break;
    }
    return (
      <Layer basisX={s.basisX} basisY={s.basisY} x={s.x} y={s.y} width={s.width} height={s.height}>
        <LayerSet>
          <Layer basisX={"left"} basisY={"top"} x={move.x} y={move.y} width={s.width} height={s.height}>
            <canvas ref="surface" style={{
              position: "absolute", top: "0px", left: "0px",
              marginLeft: -basePosX+"px", marginTop :-basePosY+"px"}}
              onMouseDown={this.onSurfaceMouseDown.bind(this)}
              onTouchStart={this.onSurfaceMouseDown.bind(this)}
            ></canvas>
          </Layer>
          <Layer basisX={b.basisX} basisY={b.basisY} x={b.x} y={b.y} width={b.width} height={b.height}>
            <canvas width={b.width} height={b.height} ref="balloon" style={{position:"absolute", top:0+"px", left:0+"px"}}></canvas>
            <div style={{position:"absolute", top:0+"px", left:0+"px", width:b.width+"px", height:b.height+"px"}}>
              "hi"
            </div>
          </Layer>
        </LayerSet>
      </Layer>
    );
  }
  onSurfaceMouseDown(ev: React.MouseEvent|React.TouchEvent): void {
    const {scopeState} = this.props;
    const {scope} = scopeState;
    // canvas に紐付けるのはこいつだけ
    // namesState.hover() してほしい
    scopeState.emit("onSurfaceMouseDown", { type: "onSurfaceMouseDown", event, scope });
  }
}

export interface SurfaceDrawEvent {
  type: "onSurfaceDraw";
  canvas: HTMLCanvasElement;
  scope: MS.Scope;
}

export interface SurfaceMouseDownEvent {
  type: "onSurfaceMouseDown";
  event: React.MouseEvent|React.TouchEvent;
  scope: MS.Scope;
}