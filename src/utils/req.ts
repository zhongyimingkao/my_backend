// api.ts
// api.ts
import { message } from 'antd';
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { useRouter } from 'next/navigation';

// 创建axios实例，配置通用基本URL
const instance: AxiosInstance = axios.create({
  baseURL: '/api/', // 将此替换为您的API地址
});

// 从localStorage获取token

// 设置请求拦截器
instance.interceptors.request.use(
  (config: any) => {
    const token = localStorage.getItem('token');
    // 如果存在token，则将其添加到请求头的Authorization中
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }
    return config;
  },
  (error) => {
    // 处理请求错误
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// 设置响应拦截器
instance.interceptors.response.use(
  function (response: any) {
    return response.data;
  },
  function (error) {
    return Promise.reject(error);
  }
);

export interface CommonResp<T> {
  code: number;
  data: T;
  msg: string;
}

export type PageType = {
  pageSize: number;
  pageNum: number;
};

export default instance;
