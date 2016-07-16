import {DataHandlerBase} from "./data_handler_base.ts";
import {Descript} from "./descript.ts";

export class ShellData extends DataHandlerBase {
    static async buildFromDirectory(directory: {[path: string]: Uint8Array}): Promise<ShellData> {
        return Promise.all([
            ShellData.getDescript(directory),
            ShellData.getImages(directory),
            ShellData.getSurfaces(directory),
            ShellData.getSurfaceTable(directory),
        ]).then((args) => {
            return new ShellData(args[0], args[1], args[2], args[3]);
        });
    }

    static selectSurfacePaths(directory: {[path: string]: any}) {
        return Object.keys(directory).filter((path) => /(?:^|\b)surfaces.*\.txt$/i.test(path));
    }

    static selectSurfaces(directory: {[path: string]: Uint8Array}) {
        return ShellData.selectSurfacePaths(directory).sort().map((path) => ShellData.bufferToString(directory[path]));
    }

    static parseSurfaces(str: string[]) {
        return {}; // TODO
    }

    static getSurfaces(directory: {[path: string]: Uint8Array}) {
        return ShellData.parseSurfaces(ShellData.selectSurfaces(directory));
    }

    static selectSurfaceTablePaths(directory: {[path: string]: any}) {
        return Object.keys(directory).filter((path) => /(?:^|\b)surfacetable.*\.txt$/i.test(path));
    }

    static selectSurfaceTables(directory: {[path: string]: Uint8Array}) {
        return ShellData.selectSurfacePaths(directory).sort().map((path) => ShellData.bufferToString(directory[path]));
    }

    static parseSurfaceTable(str: string[]) {
        return {}; // TODO
    }

    static getSurfaceTable(directory: {[path: string]: Uint8Array}) {
        return ShellData.parseSurfaceTable(ShellData.selectSurfaceTables(directory));
    }

    descript: Descript;

    alias: { [name: string]: number };

    constructor(descript: Descript, surfaceResources: any, surfaceDefinition: any, surfaceTable: any) {
        super();
    }

    surface(id: number) {
        return new Image();
    }

    unload() {

    }
}
