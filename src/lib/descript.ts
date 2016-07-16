export class Descript {

    charset: string;
    name: string;
    homeurl: string;
    readme: string;

    static parse(str: string) {
        return new Descript({});
    }

    constructor(properties: { [name: string]: any } = {}) {
        for (const name of Object.keys(properties)) {
            (<any>this)[name] = properties[name];
        }
    }
}
