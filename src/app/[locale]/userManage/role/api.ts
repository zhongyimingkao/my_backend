import { PageType } from '@/utils/req';
import req from '@/utils/req';
import { RoleInfo } from './type';

type QueryRoleReq = Partial<RoleInfo> & PageType;

// 分页查询角色列表
export const queryRoleList = (params: QueryRoleReq): Promise<any> => {
  return new Promise((resolve, reject) => {
    req
      .post('/roleController/pageData', { ...params })
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

// 保存或更新角色
export const saveRole = (params: Partial<RoleInfo>): Promise<any> => {
  return new Promise((resolve, reject) => {
    req
      .post('/roleController/saveRole', params)
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

export const getWarehouseMenus = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    req
      .get('/warehouseController/getWarehouseMenus?id=1')
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


export const deleteRoleInfo = (id: number): Promise<any> => {
  return new Promise((resolve, reject) => {
    req
      .delete('/roleController/deleteRole', {
        params: { id },
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
