import { WarehouseInventory } from '../warehouse/type';

export type StoreIn = WarehouseInventory & { rkTime: string };

export type StoreOut = WarehouseInventory & { 
  ckTime: string; 
  status: number; 
  picUrl?: string; // 出库图片URL，多张图片用|||分隔
};