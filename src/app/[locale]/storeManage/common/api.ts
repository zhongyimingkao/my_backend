import { CommonResp, PageType } from '@/utils/req';
import req from '@/utils/req';
import { StoreIn, StoreOut } from './type';

export type QueryPageInboundReq = Partial<StoreIn> & {
  start?: string;
  end?: string;
} & PageType;

export const queryPageInbound = (params: QueryPageInboundReq): Promise<any> => {
  return new Promise((resolve, reject) => {
    req
      .post('/inboundController/pageInbound', { ...params })
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

export type QueryPageOutboundReq = Partial<StoreOut> & {
  start?: string;
  end?: string;
} & PageType;
export const queryPageOutbound = (
  params: QueryPageOutboundReq
): Promise<any> => {
  return new Promise((resolve, reject) => {
    req
      .post('/outboundController/pageOutbound', { ...params })
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
