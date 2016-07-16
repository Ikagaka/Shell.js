import {DataHandlerBase} from "./data_handler_base.ts";
import {Descript} from "./descript.ts";

export class BalloonData extends DataHandlerBase {
    static async buildFromDirectory(directory: any): Promise<BalloonData> {
        // TODO dummy
        const balloonData = new BalloonData(new Descript({}), 1, 1, 1);
        return new Promise<BalloonData>((resolve) => resolve(balloonData));
    }

    readonly descript: Descript;

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
