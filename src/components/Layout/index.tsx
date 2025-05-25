'use client';
import React, { useEffect, useState } from 'react';
import {
  Layout,
  Menu,
  theme,
  Avatar,
  Dropdown,
  ConfigProvider,
  type MenuProps,
  Tooltip,
} from 'antd';
import { getCommonNavList, getHomeNavList } from './menu';
import { useParams, useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { Link, pathnames, usePathname } from '../../navigation';
import styles from './index.module.less';
import { useAtom } from 'jotai';
import { userInfo, warehouseInfo } from '@/app/[locale]/store';
import zhCN from 'antd/locale/zh_CN';
import { Warehouse } from '@/app/[locale]/user/type';
import { queryWareHouse } from '@/app/[locale]/user/api';

const { Header, Content } = Layout;

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
  const [curUserInfo] = useAtom(userInfo);
  const isSuperAdmin = curUserInfo?.data?.role === 2;
  const [curWarehouseInfo, setWarehouseInfo] = useAtom(warehouseInfo);
  const { warehouseID } = useParams();

  const updateUserInfo = async () => {
    if (!warehouseID) {
      setWarehouseInfo(null);
      return;
    }
    const res = await queryWareHouse();
    const curInfo = res.records.find(item => item.id === Number(warehouseID));
    setWarehouseInfo(curInfo);
  };

  useEffect(() => {
    updateUserInfo();
  }, [warehouseID, pathname]); // 添加 pathname 作为依赖

  const navList = !!warehouseID ? getHomeNavList(t) : getCommonNavList(t, isSuperAdmin);
  const [curTheme, setCurTheme] = useState<boolean>(sessionStorage.getItem('backend_theme') === 'true' ? true : false);

  const handleSelect = (row: { key: string }) => {
    const path = warehouseID ? row.key.replace(':warehouseID', warehouseID as string) : row.key;
    router.push(path);
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1a5f9c',
          colorSuccess: '#27ae60',
          colorBgContainer: '#d6e7f5',
          colorBgLayout: '#c5dcef',
          colorText: '#2c3e50',
          colorTextSecondary: '#4a5b6c',
          colorBorder: '#8fb3d5',
          colorBorderSecondary: '#b0c9e2',
          borderRadius: 6,
          wireframe: false,
        },
        components: {
          Layout: {
            headerBg: '#1a5f9c',
            bodyBg: '#c5dcef',
          },
          Menu: {
            darkItemBg: '#1a5f9c',
            darkItemSelectedBg: '#27ae60',
            darkItemHoverBg: '#2a7bc1',
          },
          Button: {
            defaultBg: '#d6e7f5',
            defaultBorderColor: '#8fb3d5',
            defaultColor: '#1a5f9c',
            linkHoverBg: '#27ae60',
          },
          Table: {
            headerBg: '#b8d4eb',
            headerColor: '#1a5f9c',
            borderColor: '#8fb3d5',
            rowHoverBg: 'rgba(26, 95, 156, 0.1)',
          },
          Badge: {
            colorBgBase: '#27ae60',
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
              background: '#1a5f9c'
            }}
          >
            <div className={styles.leftControl}>
              <Tooltip title='点击返回首页'>
                <span
                  className={styles.logo}
                  onClick={() => { router.push('/'); }}
                  style={{
                    color: '#fff',
                    fontWeight: 'bold',
                    fontSize: '18px',
                    padding: '0 16px',
                    cursor: 'pointer'
                  }}
                >
                  {curWarehouseInfo ? '当前仓库：' + curWarehouseInfo.warehouseName : '物资后台管理'}
                </span>
              </Tooltip>

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
                padding: "24px 16px",
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