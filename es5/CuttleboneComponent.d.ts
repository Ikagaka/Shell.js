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
    content: any;
}
export interface LayerState {
}
export declare class Layer extends React.Component<LayerProps, LayerState> {
    style: {
        [key: string]: string;
    };
    constructor(props: LayerProps);
    render(): JSX.Element;
}
export interface LayerSetProps extends React.Props<LayerSet> {
    style?: {
        [key: string]: string;
    };
    layers: LayerProps[];
}
export interface LayerSetState {
}
export declare class LayerSet extends React.Component<LayerSetProps, LayerSetState> {
    style: {
        [key: string]: string;
    };
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
    style: {
        display: "block";
        position: "static";
        boxSizing: "border-box";
    };
    constructor(props: DocProps);
    render(): JSX.Element;
}
