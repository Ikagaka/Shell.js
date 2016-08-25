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
