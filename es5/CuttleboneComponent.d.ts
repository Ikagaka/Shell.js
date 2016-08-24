import * as SM from "./SurfaceModel";
import * as React from 'react';
export interface LayerProps extends React.Props<Layer> {
    style?: {
        [key: string]: string;
    };
    width: number;
    height: number;
    basisX: "left" | "right";
    basisY: "top" | "bottom";
    x: number;
    y: number;
}
export interface LayerState {
}
export declare class Layer extends React.Component<LayerProps, LayerState> {
    constructor(props: LayerProps);
    render(): JSX.Element;
}
export interface LayerSetProps extends React.Props<LayerSet> {
    style?: {
        [key: string]: string;
    };
}
export interface LayerSetState {
}
export declare class LayerSet extends React.Component<LayerSetProps, LayerSetState> {
    constructor(props: LayerSetProps);
    render(): JSX.Element;
}
export interface DocProps extends React.Props<Doc> {
    style?: {
        [key: string]: string;
    };
}
export interface DocState {
}
export declare class Doc extends React.Component<DocProps, DocState> {
    constructor(props: DocProps);
    render(): JSX.Element;
}
export interface ScopeProps extends React.Props<Scope> {
    style?: {
        [key: string]: string;
    };
    surface: SM.Surface;
}
export interface ScopeState {
}
export declare class Scope extends React.Component<ScopeProps, ScopeState> {
    constructor(props: ScopeProps);
    render(): JSX.Element;
}
export interface CuttleboneProps extends React.Props<Cuttlebone> {
    style?: {
        [key: string]: string;
    };
}
export interface CuttleboneState {
}
export declare class Cuttlebone extends React.Component<CuttleboneProps, CuttleboneState> {
    style: {
        [key: string]: string;
    };
}
