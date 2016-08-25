import * as ST from "./SurfaceTree";
import * as SML from "./ShellModelLoader";
import * as BC from "./BaseComponent";
import * as SR from "./SurfaceRenderer";
import * as SS from "./SurfaceState";
import * as SHS from "./ShellState";
import * as SPR from "./SurfacePatternRenderer";
import * as SU from "./SurfaceUtil";
import * as SM from "./SurfaceModel";
import * as SH from "./ShellModel";
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import narloader = require("narloader");
const NL = narloader.NarLoader;
import $ = require("jquery");

export type NULL = null; // vscode hack

export interface ScopeProps extends React.Props<Scope> {
  surfaceId: number;
  scopeId: number;
  shell: SH.Shell;
  renderer: SPR.SurfacePatternRenderer;
}
export interface ScopeState {
  width: number;
  height: number;
  x: number;
  y: number;
}
export class Scope extends React.Component<ScopeProps, ScopeState> {
  surfaceState: SS.SurfaceState|NULL;
  screenX: number;
  screenY: number;
  constructor(props: ScopeProps) {
    super(props);
    this.screenX = 0;
    this.screenY = 0;
    this.state = {width: 0, height: 0, x: 0, y: 0};
    this.surfaceState = null;
  }
  componentDidMount(){
    const {renderer, scopeId, surfaceId, shell} = this.props;
    renderer.getBaseSurfaceSize(surfaceId).then(({width, height})=>{
      const surface = new SM.Surface(scopeId, surfaceId, width, height, shell);
      // アニメーション開始
      this.surfaceState = new SS.SurfaceState(surface, (ev, surface)=>
        renderer.render(surface).then((srfcnv)=>{
          const canvas = ReactDOM.findDOMNode(this.refs["surface"]) as HTMLCanvasElement;
          const rndr = new SR.SurfaceRenderer(canvas);
          rndr.base(srfcnv);
        } ) );
      this.surfaceState.debug = true;
      return this.surfaceState.render().then(()=>{
        // setStateのタイミングでrenderが呼ばれるので
        this.setState({width, height, x:this.state.x, y:this.state.y});
      });
    });
  }
  componentDidUpdate() {
    if(this.surfaceState instanceof SS.SurfaceState){
      this.surfaceState.render();
    }
  }
  componentWillUnmount() {
    if(this.surfaceState instanceof SS.SurfaceState){
      this.surfaceState.destructor();
    }
  }
  render(){
    const {width, height, x, y} = this.state;
    const s: BC.LayerProps = {
      width: width, height: height,
      basisX: "left",
      basisY: "top",
      x: x, y: y
    };
    if(this.surfaceState instanceof SS.SurfaceState){
      const {config, move, scopeId, surfaceId, width, height, basepos, surfaceNode, alignmenttodesktop} = this.surfaceState.surface;
      s.x -= basepos.x;
      s.y -= basepos.y;
      switch (alignmenttodesktop){
        case "top": s.y=0; break;
        case "bottom": s.basisY="bottom"; s.y=0; break;
        case "right": s.basisX="right"; s.x=0; break;
        case "left": s.basisX="left"; s.x=0; break;
        case "free": break;
      }
    }
    const b: BC.LayerProps = {
      width: 200, height: 100,
      basisX: "left", basisY: "top",
      x: 0, y: 0
    };
    switch (b.basisX){
      case "left":  b.x -= b.width; break;
      case "right": b.x += b.width; break;
    }
    return (
      <BC.Layer basisX={s.basisX} basisY={s.basisY} x={s.x} y={s.y} width={s.width} height={s.height}>
        <BC.LayerSet>
          <BC.Layer basisX={"left"} basisY={"top"} x={0} y={0} width={s.width} height={s.height}>
            <canvas ref="surface" style={{position:"absolute", top:"0px", left:"0px"}}
              onMouseDown={this.onSurfaceMouseDown.bind(this)} onMouseMove={this.onSurfaceMouseMove.bind(this)} onMouseUp={this.onSurfaceMouseUp.bind(this)}
              onTouchStart={this.onSurfaceMouseDown.bind(this)} onTouchMove={this.onSurfaceMouseMove.bind(this)} onTouchEnd={this.onSurfaceMouseUp.bind(this)} onTouchCancel={this.onSurfaceMouseUp.bind(this)}></canvas>
          </BC.Layer>
          <BC.Layer basisX={b.basisX} basisY={b.basisY} x={b.x} y={b.y} width={b.width} height={b.height}>
            <canvas width={b.width} height={b.height} ref="balloon" style={{position:"absolute", top:0+"px", left:0+"px"}}></canvas>
            <div style={{position:"absolute", top:0+"px", left:0+"px", width:b.width+"px", height:b.height+"px"}}>
              "hi"
            </div>
          </BC.Layer>
        </BC.LayerSet>
      </BC.Layer>
    );
  }
  onSurfaceMouseDown(ev: React.MouseEvent): void {
    console.log(ev.type, ev, this);
    this.screenX = ev.screenX;
    this.screenY = ev.screenY;
  }
  onSurfaceMouseMove(ev: React.MouseEvent): void {
    console.log(ev.type, ev, this);
    const diffX = this.screenX - ev.screenX;
    const diffY = this.screenY - ev.screenY;
    this.setState({width:this.state.width, height:this.state.height, x:this.state.x+diffX, y:this.state.y+diffY});
  }
  onSurfaceMouseUp(ev: React.MouseEvent): void {
    console.log(ev.type, ev, this);
    this.screenX = 0;
    this.screenY = 0;
  }
}



export interface NamedProps extends React.Props<Named>{
  shell: SH.Shell;
  renderer: SPR.SurfacePatternRenderer;
}
export interface NamedState {}
export class Named extends React.Component<NamedProps, NamedState> {
  render(){
    return (
      <BC.LayerSet>
        <Scope scopeId={0} surfaceId={0}  shell={this.props.shell} renderer={this.props.renderer}></Scope>
        <Scope scopeId={1} surfaceId={10} shell={this.props.shell} renderer={this.props.renderer}></Scope>
      </BC.LayerSet>
    );
  }
}






