'use client';
import React, { useState } from 'react';
import {
  Layout,
  Menu,
  theme,
  Avatar,
  Dropdown,
  ConfigProvider,
  Badge,
  Popover,
  type MenuProps,
} from 'antd';
import { getCommonNavList, getExtraNavList } from './menu';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import {
  BellOutlined,
  MoonOutlined,
  SunOutlined,
  TransactionOutlined,
} from '@ant-design/icons';
import { getThemeBg } from '@/utils';
import { Link, pathnames, usePathname } from '../../navigation';
import styles from './index.module.less';
import { useAtom } from 'jotai';
import { userInfo } from '@/app/[locale]/store';
import zhCN from 'antd/locale/zh_CN';

const { Header, Content, Footer, Sider } = Layout;

interface IProps {
  children: React.ReactNode;
  curActive: string;
  defaultOpen?: string[];
}

const items: MenuProps['items'] = [
  {
    key: '1',
    label: (
      <a
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => {
          location.href = '/user/login';
          localStorage.setItem('token', '');
        }}
      >
        退出登录
      </a>
    ),
  },
];

const CommonLayout: React.FC<IProps> = ({
  children,
  curActive,
  defaultOpen = ['/'],
}) => {
  const {
    token: { borderRadiusLG, colorTextBase, colorWarningText },
  } = theme.useToken();

  const t = useTranslations('global');

  const locale = useLocale();
  const otherLocale: any = locale === 'en' ? ['zh', '中'] : ['en', 'En'];

  const router = useRouter();
  const pathname = usePathname();
  let navList = getCommonNavList(t);

  const [curUserInfo] = useAtom(userInfo);


  // 超管有额外的目录展示
  if (curUserInfo?.data?.role === 2) {
    navList = [...navList, ...getExtraNavList(t)];
  }

  const [curTheme, setCurTheme] = useState<boolean>(sessionStorage.getItem('backend_theme') === 'true' ? true : false);
  const toggleTheme = () => {
    sessionStorage.setItem('backend_theme', String(!curTheme));
    setCurTheme((prev) => !prev);
  };

  const handleSelect = (row: { key: string }) => {
    router.push(row.key);
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1a5f9c',  // 更深的科技蓝
          colorSuccess: '#27ae60',  // 保持绿色
          colorBgContainer: '#d6e7f5',  // 稍深的背景
          colorBgLayout: '#c5dcef',  // 更深的布局背景
          colorText: '#2c3e50',  // 深灰色文字
          colorTextSecondary: '#4a5b6c',
          colorBorder: '#8fb3d5',  // 更深的蓝色边框
          colorBorderSecondary: '#b0c9e2',
          borderRadius: 6,
          wireframe: false,
        },
        components: {
          Layout: {
            headerBg: '#1a5f9c',  // 深蓝色顶部栏
            bodyBg: '#c5dcef',
          },
          Menu: {
            darkItemBg: '#1a5f9c',
            darkItemSelectedBg: '#27ae60',  // 绿色选中项
            darkItemHoverBg: '#2a7bc1',
          },
          Button: {
            defaultBg: '#d6e7f5',
            defaultBorderColor: '#8fb3d5',
            defaultColor: '#1a5f9c',
            linkHoverBg: '#27ae60',  // 悬停绿色
          },
          Table: {
            headerBg: '#b8d4eb',
            headerColor: '#1a5f9c',
            borderColor: '#8fb3d5',
            rowHoverBg: 'rgba(26, 95, 156, 0.1)',
          },
          Badge: {
            colorBgBase: '#27ae60',  // 绿色徽章
          }
        },
      }}
      locale={zhCN}
    >
      <Layout style={{ minHeight: '100vh' }}>
        <Layout>
          <Header
            style={{
              padding: 0,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#1a5f9c'  // 确保Header使用主题色
            }}
          >
            <div className={styles.leftControl}>
              <span
                className={styles.logo}
                style={{
                  color: '#fff',  // 白色字体
                  fontWeight: 'bold',
                  fontSize: '18px',
                  padding: '0 16px'
                }}
              >
                物资后台管理
              </span>
              <Menu
                style={{
                  flex: 1
                }}
                theme='dark'
                mode="horizontal"
                defaultSelectedKeys={[curActive]}
                items={navList}
                defaultOpenKeys={defaultOpen}
                onSelect={handleSelect}
              />
            </div>
            <div className={styles.rightControl}>
              <div className={styles.avatar}>
                <Dropdown
                  menu={{ items }}
                  placement="bottomLeft"
                  arrow
                >
                  <Avatar
                    style={{ color: '#fff', backgroundColor: colorTextBase }}
                  >
                    Admin
                  </Avatar>
                </Dropdown>
              </div>
            </div>
          </Header>
          <Content style={{
          }}>
            <div
              style={{
                height: '100%',
                borderRadius: borderRadiusLG,
                padding:"24px 16px",
              }}
            >
              {children}
            </div>
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
};

export default CommonLayout;
