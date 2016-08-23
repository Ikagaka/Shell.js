import * as React from 'react';
export declare class Doc<P, S> extends React.Component<P, S> {
    style: {
        display: "block";
        position: "static";
        boxSizing: "border-box";
    };
    constructor();
    render(): JSX.Element;
}
export declare class Layer<P, S> extends React.Component<P, S> {
    style: {
        display: "inline-block";
        position: "absolute";
        boxSizing: "border-box";
        margin: "0px";
        border: "none";
        padding: "0px";
    };
    render(): JSX.Element;
}
export declare class LayerSet<P, S> extends React.Component<P, S> {
    style: {
        display: "block";
        position: "relative";
        boxSizing: "border-box";
        width: "100%";
        height: "100%";
        margin: "0px";
        border: "none";
        padding: "0px";
    };
    render(): JSX.Element;
}
export declare class Cuttlebone<P, S> extends React.Component<P, S> {
    style: {
        display: "block";
        position: "static";
        boxSizing: "border-box";
    };
    constructor();
    render(): React.DOMElement<{
        style: {
            display: "block";
            position: "static";
            boxSizing: "border-box";
        };
    }, Element>;
}
export declare class Named<P, S> extends Layer<P, S> {
    render(): JSX.Element;
}
export declare class Scope<P, S> extends Layer<P, S> {
    render(): JSX.Element;
}
