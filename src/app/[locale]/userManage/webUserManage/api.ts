import { PageType } from '@/utils/req';
import req from '@/utils/req';
import { UserInfo } from './type';

type QueryUserInfoReq = Partial<UserInfo> & PageType;

export const queryWebUserList = (params: QueryUserInfoReq): Promise<any> => {
  return new Promise((resolve, reject) => {
    req
      .post('/userController/pageUser', { ...params })
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

export const updateUserInfo = (params: Partial<UserInfo>): Promise<any> => {
  return new Promise((resolve, reject) => {
    req
      .post('/userController/saveUser', params)
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


export const deleteUserInfo = (id: number): Promise<any> => {
  return new Promise((resolve, reject) => {
    req
      .delete('/userController/deleteUserById', {
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