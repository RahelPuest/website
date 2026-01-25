import { Texture, Polygon } from "pixi.js";

export class RoomState {
    public readonly id: string;

    public readonly background: Texture;
    public readonly walkMask: Polygon;

    public readonly itemIds: string[] = [];

    public constructor(opts: {
        id: string;
        background: Texture;
        walkMask: Polygon;
        itemIds: string[];
    }) {
        this.id = opts.id;
        this.background = opts.background;
        this.walkMask = opts.walkMask;
        this.itemIds = opts.itemIds;
    }

    public addItemId(id: string) {
        this.itemIds.push(id);
    }
}