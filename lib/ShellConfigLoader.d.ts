import * as SC from "./ShellConfig";
export declare function loadFromJSONLike(json: SC.JSONLike): Promise<SC.ShellConfig>;
export declare function loadCharConfig(char: SC.JSONLike): Promise<SC.CharConfig>;
