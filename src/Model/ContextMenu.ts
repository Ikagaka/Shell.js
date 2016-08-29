
export interface ContextMenuObject {
  items: {[itemId: string]: Item|SubGroup}
}
export interface Item {
  name: string;
  callback: (itemId: string)=> void;
}
export interface SubGroup {
  name: string;
  items: {[key: string]: Item|SubGroup};
}