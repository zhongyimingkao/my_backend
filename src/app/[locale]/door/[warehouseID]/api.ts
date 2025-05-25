import { QueryDoorInfoReq } from "./type";
import req, { PageType } from '@/utils/req';


type _QueryDoorInfoReq = Partial<QueryDoorInfoReq> & PageType;

export const queryDoorInfo = (params: _QueryDoorInfoReq): Promise<any> => {
    return new Promise((resolve, reject) => {
      req
        .post('/doorController/pageWarehouse', { ...params })
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