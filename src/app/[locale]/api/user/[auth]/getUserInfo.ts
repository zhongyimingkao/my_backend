import req from '@/utils/req';
import { message } from 'antd';

export const updateUserInfo = (
  setUserInfo: (userInfo: Record<string, any>) => void,
  callBack?: () => void
) => {
  req
    .get<Record<string, any>>('userController/getUserInfo')
    .then((res: any) => {
      if(res.code===401){
        message.warning('登录状态失效');
        location.href = '/user/login';
      }
      if (res.code === 200) {
        setUserInfo(res);
        callBack?.();
      }
    });
};
