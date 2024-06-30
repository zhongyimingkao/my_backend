'use client'

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';


const IndexPage: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    const checkCookieAndNavigate = async () => {
      const cookieValue = localStorage.getItem('token'); // 替换为你的cookie名称

      if (cookieValue) {
        // 如果有cookie，重定向到./dashboard
        router.push('/dashboard');
      } else {
        // 如果没有cookie，重定向到./login
        router.push('user/login');
      }
    };

    checkCookieAndNavigate();
  }, []); // 空数组作为依赖，确保只在组件挂载时执行一次

  return <div>正在处理...</div>; // 这个返回值只会在页面加载时显示，之后会被重定向覆盖
};

export default IndexPage;