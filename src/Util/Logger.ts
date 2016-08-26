import * as SU from "./index";

export class DiffLogger<T>{
  o: T;
  changeLog: [number, SU.SUDiff][];
  constructor(o: T){
    this.o = o;
    this.changeLog = [];
  }

  logger(manipulation: Function){
    const tmp = SU.extend(true, {}, this.o);
    manipulation();
    const diff = SU.diff(tmp, this.o);
    this.changeLog.push([Date.now(), diff]);
  }
}