import req from '@/utils/req';

export const updateUserInfo = (
  setUserInfo: (userInfo: Record<string, any>) => void,
  callBack?: () => void
) => {
  req
    .get<Record<string, any>>('userController/getUserInfo')
    .then((res: any) => {
      if (res.code === 200) {
        setUserInfo(res);
        callBack?.();
      }
    });
};
