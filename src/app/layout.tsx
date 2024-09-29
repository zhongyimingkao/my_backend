'use client';
import { ReactNode, useEffect } from 'react';
import { useAtom } from 'jotai';
import { updateUserInfo } from './[locale]/api/user/[auth]/getUserInfo';
import { userInfo } from './[locale]/store';

type Props = {
  children: ReactNode;
};

export default function RootLayout({ children }: Props) {
  const [curUserInfo, setUserInfo] = useAtom(userInfo);
  useEffect(() => {
    const asPath = window.location.pathname; // 使用 window.location.pathname 获取当前页面的相对路径

    // 如果当前路径是 /user/login，则不执行请求逻辑
    if (asPath === '/user/login') {
      return;
    }
    if(!curUserInfo){
      updateUserInfo(setUserInfo);
    }
  }, []);
  return children;
}
