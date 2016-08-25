import * as SS from "./SurfaceState";
import * as SPR from "./SurfacePatternRenderer";
import * as SH from "./ShellModel";
import * as React from 'react';
export declare type NULL = null;
export interface ScopeProps extends React.Props<Scope> {
    surfaceId: number;
    scopeId: number;
    shell: SH.Shell;
    renderer: SPR.SurfacePatternRenderer;
}
export interface ScopeState {
    width: number;
    height: number;
}
export declare class Scope extends React.Component<ScopeProps, ScopeState> {
    surfaceState: SS.SurfaceState | NULL;
    constructor(props: ScopeProps);
    componentWillMount(): void;
    componentDidMount(): void;
    componentWillUnmount(): void;
    render(): JSX.Element;
}
export interface NamedProps extends React.Props<Named> {
    shell: SH.Shell;
    renderer: SPR.SurfacePatternRenderer;
}
export interface NamedState {
}
export declare class Named extends React.Component<NamedProps, NamedState> {
    constructor(props: NamedProps);
    componentWillMount(): void;
    componentDidMount(): void;
    componentWillUnmount(): void;
    render(): JSX.Element;
}
