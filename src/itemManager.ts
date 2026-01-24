import { Item } from "./item";

export class ItemManager {
  private itemRegistry = new Map<string, Item>();

  public add(id: string, item: Item): void {
    this.itemRegistry.set(id, item);
  }

  public getById(id: string): Item | undefined {
    return this.itemRegistry.get(id);
  }
}
