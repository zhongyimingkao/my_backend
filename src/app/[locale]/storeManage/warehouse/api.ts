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

export const saveWareHouse = (params: Partial<Warehouse>): Promise<any> => {
  return new Promise((resolve, reject) => {
    req
      .post('/warehouseController/saveWarehouse', { ...params })
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

export const openWareHouse = (id: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    req
      .get('/warehouseController/openWarehouse', {
        params: { ckxxId: 403403403, warehouseId: id },
      })
      .then((res: any) => {
        if (res.code === 200) {
          resolve();
        } else {
          reject();
        }
      })
      .catch((e) => {
        reject(e);
      });
  });
};

export const closeWareHouse = (id: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    req
      .get('/warehouseController/closeWarehouse', {
        params: { warehouseId: id },
      })
      .then((res: any) => {
        if (res.code === 200) {
          resolve();
        } else {
          reject();
        }
      })
      .catch((e) => {
        reject(e);
      });
  });
};

export const deleteWareHouse = (id: number): Promise<any> => {
  return new Promise((resolve, reject) => {
    req
      .delete('/warehouseController/deleteWarehouseById', { params: { id } })
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
