'use client';
import { ReactNode, useEffect } from 'react';
import { useAtom } from 'jotai';
import { userInfo } from './[locale]/store';
import { useRouter } from 'next/navigation';
import { message } from 'antd';
import { updateUserInfo } from './[locale]/api/user/[auth]/getUserInfo';

type Props = {
  children: ReactNode;
};

export default function RootLayout({ children }: Props) {
  const [, setUserInfo] = useAtom(userInfo);
  const router = useRouter();
  useEffect(() => {
    const asPath = window.location.pathname; // 使用 window.location.pathname 获取当前页面的相对路径

    // 如果当前路径是 /user/login，则不执行请求逻辑
    if (asPath === '/user/login') {
      return;
    }
    updateUserInfo(setUserInfo);
  }, []);
  return children;
}
