import { WarehouseInventory } from '../warehouse/type';

export type StoreIn = WarehouseInventory & { rkTime: string };

export type StoreOut = WarehouseInventory & { ckTime: string; status: number };
