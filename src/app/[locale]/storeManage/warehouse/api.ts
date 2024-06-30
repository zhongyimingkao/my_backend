import { CommonResp, PageType } from '@/utils/req';
import { Warehouse, WarehouseInventory } from './type';
import req from '@/utils/req';

type QueryWarehouseReq = Partial<Warehouse> & PageType;

export const queryWareHouse = (params: QueryWarehouseReq): Promise<any> => {
  return new Promise((resolve, reject) => {
    req
      .post('/warehouseController/pageWarehouse', { ...params })
      .then((res: any) => {
        if (res.code === 200) {
          resolve(res.data);
        } else {
          reject(res);
        }
      })
      .catch((e) => {
        reject(e);
      });
  });
};

export const queryWarehouseInventory = (warehouseId: number): Promise<any> => {
  return new Promise((resolve, reject) => {
    req
      .post('/inventoryController/queryWarehouseInventory', {
        params: { warehouseId },
      })
      .then((res: any) => {
        if (res.code === 200) {
          resolve(res.data);
        } else {
          reject(res);
        }
      })
      .catch((e) => {
        reject(e);
      });
  });
};
