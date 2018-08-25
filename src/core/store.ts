
export default class Store {
  private stores: { [name: string]: any } = {};
  public set(name: string, store: any) {
    this.stores[name] = store;
  }
  public get(name: string) {
    return this.stores[name];
  }
}
