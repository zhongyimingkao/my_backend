import { PageType } from '@/utils/req';
import req from '@/utils/req';
import { WxUserInfo } from './type';

type QueryWarehouseReq = Partial<WxUserInfo> & PageType;

export const queryUserList = (params: QueryWarehouseReq): Promise<any> => {
  return new Promise((resolve, reject) => {
    req
      .post('/wxloginController/page_wx_users', { ...params })
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

export const updateUser = ({
  role,
  id,
}: {
  role: 'user' | 'admin';
  id: number;
}): Promise<any> => {
  return new Promise((resolve, reject) => {
    req
      .post('/wxloginController/update_wx_user', { role, id })
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
