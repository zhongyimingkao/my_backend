'use client';
import { useTranslations } from 'next-intl';
import { Button, Form, Input, message, type FormProps } from 'antd';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginApi } from './api';

import styles from './index.module.less';
import { useAtom } from 'jotai';
import { userInfo } from '../../store';
import { updateUserInfo } from '../../api/user/[auth]/getUserInfo';

export type FieldType = {
  loginName: string;
  password: string;
};

export default function Login() {
  const t = useTranslations();
  const [form] = Form.useForm();
  const router = useRouter();
  const [, setUserInfo] = useAtom(userInfo);

  const onFinish: FormProps<FieldType>['onFinish'] = (values: FieldType) => {
    const { loginName, password } = values;
    loginApi({ loginName, password })
      .then((res: any) => {
        if (res?.code === 200) {
          localStorage.setItem('token', res.data);
          message.success('登录成功');
          updateUserInfo(setUserInfo, () => {
            router.push('/dashboard');
          });
        } else if (res?.code !== 401) {
          // 401已经统一处理了
          message.error('登录失败: ' + res?.msg);
        }
      })
      .catch(() => {
        message.error('登录失败');
      });
    return;
  };

  return (
    <main className={styles.loginWrap}>
      <div className={styles.leftBanner}>
        <span className={styles.logo}>后台管理系统</span>
        <div className={styles.banner}>
          <img
            src="/logo_bg.svg"
            alt=""
          />
        </div>
      </div>
      <div className={styles.content}>
        <div className={styles.innerContent}>
          <h1>欢迎登录 物料中后台管理系统</h1>
          <Form
            name="basic"
            className={styles.form}
            wrapperCol={{ span: 24 }}
            style={{ maxWidth: 420 }}
            form={form}
            onFinish={onFinish}
            initialValues={{
              email: 'dooring@next.com',
              pwd: 'dooring.vip',
            }}
            autoComplete="off"
          >
            {
              <>
                <Form.Item<FieldType>
                  name="loginName"
                  rules={[
                    {
                      required: true,
                      message: '帐号不能为空',
                    },
                  ]}
                >
                  <Input
                    placeholder="请输入帐号"
                    size="large"
                    variant="filled"
                  />
                </Form.Item>

                <Form.Item<FieldType>
                  name="password"
                  rules={[{ required: true, message: '请输入密码' }]}
                >
                  <Input.Password
                    size="large"
                    placeholder="请输入密码"
                    variant="filled"
                  />
                </Form.Item>

                <Form.Item wrapperCol={{ span: 24 }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    block
                    size="large"
                  >
                    登录
                  </Button>
                </Form.Item>
              </>
            }
          </Form>
        </div>
      </div>
    </main>
  );
}
