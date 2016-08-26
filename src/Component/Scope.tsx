import * as Util from "../Util/index";
import {Canvas} from "../Model/Canvas"
import * as MS from "../Model/Scope";
import {Shell} from "../Model/Shell";
import {Renderer} from "../Renderer/Renderer";
import {Layer, LayerSet, LayerProps} from "./Layer";

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import $ = require("jquery");
import {EventEmitter} from "events";


export interface ScopeProps extends React.Props<Scope>{
  scope: MS.Scope;
  shell: Shell;
  emitter: EventEmitter;
}
export interface ScopeStatte {}
export class Scope extends React.Component<ScopeProps, ScopeStatte> {
  constructor(props: ScopeProps) {
    super(props);
    this.state = {x: 0, y: 0};
  }
  draw() {
    const canvas = this.refs["surface"] as HTMLCanvasElement;
    const rndr = new Renderer(new Canvas(canvas));
    rndr.base(this.props.scope.srfCnv);
  }
  componentDidMount(){
    this.draw();
  }
  componentDidUpdate() {
    this.draw();
  }
  render(){
    const {surface, srfCnv, position, alignmenttodesktop, basepos, scopeId} = this.props.scope;
    const {baseWidth, baseHeight, basePosX, basePosY} = srfCnv;
    const {x,y} = position;
    const config = this.props.shell;
    const surfaceNode = this.props.shell.surfaceDefTree.surfaces[scopeId]
    const s: LayerProps = {
      width: baseWidth, height: baseHeight,
      basisX: "left",
      basisY: "top",
      x: x, y: y
    };
    const {move, surfaceId } = surface;
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
          <Layer basisX={"left"} basisY={"top"} x={0} y={0} width={s.width} height={s.height}>
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
  onSurfaceMouseDown(ev: React.MouseEvent): void {
    // canvas に紐付けるのはこいつだけ
    // todo: eventemitter
    this.props.emitter.emit("onSurfaceMouseDown", ev);
  }
}
