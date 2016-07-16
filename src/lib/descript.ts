export class Descript {

    readonly charset: string;
    readonly name: string;
    readonly homeurl: string;
    readonly readme: string;

    static parse(str: string) {
        return new Descript({});
    }

    constructor(properties: { [name: string]: any } = {}) {
        for (const name of Object.keys(properties)) {
            (<any>this)[name] = properties[name];
        }
    }
}
