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

export interface ScopeProps extends React.Props<Scope>{
  surfaceId: number;
  scopeId: number;
  shell: SH.Shell;
  renderer: SPR.SurfacePatternRenderer;
}
export interface ScopeState {
  width: number;
  height: number;
}
export class Scope extends React.Component<ScopeProps, ScopeState> {
  surfaceState: SS.SurfaceState|NULL;
  constructor(props: ScopeProps) {
    super(props);
    this.state = { width: 0, height: 0 };
    this.surfaceState = null;
  }
  componentWillMount(){
  }
  componentDidMount(){
    const {renderer, scopeId, surfaceId} = this.props;
    const canvas = ReactDOM.findDOMNode(this.refs["surface"]) as HTMLCanvasElement;
    const rndr = new SR.SurfaceRenderer(canvas);
    renderer.getBaseSurfaceSize(surfaceId).then(({width, height})=>{
      // 短形を取得
      this.setState({width, height});
      const surface = new SM.Surface(scopeId, surfaceId, width, height, renderer.shell);
      // アニメーション開始
      this.surfaceState = new SS.SurfaceState(surface, (ev, surface)=>
        renderer.render(surface).then((srfcnv)=> rndr.base(srfcnv) ) );
    });
    // イベント登録
    // window.addEventListener('resize', this.handleResize);
  }
  componentWillUnmount(){
    // アニメーション停止
    if(this.surfaceState instanceof SS.SurfaceState){
      this.surfaceState.destructor();
    }
    // イベント解除
    // window.removeEventListener('resize', this.handleResize);
  }
  render(){
    const s: BC.LayerProps = {
      width: this.state.width,
      height: this.state.height,
      basisX: "left",
      basisY: "top",
      x: 0,
      y: 0
    };
    if(this.surfaceState instanceof SS.SurfaceState){
      const {config, move, scopeId, surfaceId, width, height, basepos, surfaceNode, alignmenttodesktop} = this.surfaceState.surface;
    }
    return (
      <BC.Layer basisX={"right"} basisY={"bottom"} x={0} y={0} width={s.width} height={s.height}>
        <BC.LayerSet style={{"WebkitTapHighlightColor": "transparent"}}>
          <BC.Layer key={0} basisX={"left"} basisY={"top"} x={s.x} y={s.y} width={s.width} height={s.height} style={{"userSelect": "none"}}>
            <canvas ref="surface" width={s.width} height={s.height} style={{"userSelect": "none", "pointerEvents": "auto"}}></canvas>
          </BC.Layer>
          <BC.Layer key={1} basisX={"left"} basisY={"top"} x={-200} y={0} width={200} height={100} style={{backgroundColor: "blue"}}>
            "hi"
          </BC.Layer>
        </BC.LayerSet>
      </BC.Layer>
    );
  }
}


export interface NamedProps extends React.Props<Named>{
  shell: SH.Shell;
  renderer: SPR.SurfacePatternRenderer;
}
export interface NamedState {}
export class Named extends React.Component<NamedProps, NamedState> {
  constructor(props: NamedProps) {
    super(props);
  }
  componentWillMount(){
  }
  componentDidMount(){
    // イベント登録
    // window.addEventListener('resize', this.handleResize);
  }
  componentWillUnmount(){
    // イベント解除
    // window.removeEventListener('resize', this.handleResize);
  }
  render(){
    const namedStyle = {
      display: "block", position: "fixed",
      boxSizing: "border-box",
      bottom: "0px", right: "0px",
      height:"100%", width: "100%"
    };
    return (
      <div className="named" style={namedStyle}>
        <BC.LayerSet>
          <Scope key={0} surfaceId={0} scopeId={0} shell={this.props.shell} renderer={this.props.renderer}></Scope>
        </BC.LayerSet>
      </div>
    );
  }
}






