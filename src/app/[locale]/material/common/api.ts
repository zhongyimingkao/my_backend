import { PageType } from '@/utils/req';
import req from '@/utils/req';
import { MaterialInfo, MaterialType } from './type';

export type QueryMaterialInfoReq = Partial<MaterialInfo> & {
  material?: string;
} & PageType;

export const queryMaterialInfo = (
  params: QueryMaterialInfoReq
): Promise<any> => {
  return new Promise((resolve, reject) => {
    req
      .post('/materialController/pageMaterial', { ...params })
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

export type SaveMaterialInfoReq = Partial<MaterialInfo>;

export const saveMaterialInfo = (params: SaveMaterialInfoReq): Promise<any> => {
  return new Promise((resolve, reject) => {
    req
      .post('/materialController/saveMaterial', { ...params })
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

export const deleteMaterialInfo = (id: number): Promise<any> => {
  return new Promise((resolve, reject) => {
    req
      .delete('/materialController/deleteMaterialById', {
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

export type QueryMaterialTypeReq = Partial<MaterialType> & PageType;

export const queryMaterialType = (
  params: QueryMaterialTypeReq
): Promise<any> => {
  return new Promise((resolve, reject) => {
    req
      .post('/materialTypeController/pageMaterialType', { ...params })
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

export type SaveMaterialTypeReq = Partial<MaterialType>;

export const saveMaterialType = (params: SaveMaterialTypeReq): Promise<any> => {
  return new Promise((resolve, reject) => {
    req
      .post('/materialTypeController/saveMaterialType', { ...params })
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

export const deleteMaterialType = (id: number): Promise<any> => {
  return new Promise((resolve, reject) => {
    req
      .delete('/materialTypeController/deleteMaterialTypeById', {
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
