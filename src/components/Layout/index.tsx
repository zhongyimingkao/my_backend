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

  console.log('curUserInfo',curUserInfo);

  // 超管有额外的目录展示
  if (curUserInfo?.data?.role === 2) {
    navList = [...navList, ...getExtraNavList(t)];
  }

  const [curTheme, setCurTheme] = useState<boolean>(false);
  const toggleTheme = () => {
    setCurTheme((prev) => !prev);
  };

  const handleSelect = (row: { key: string }) => {
    router.push(row.key);
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: curTheme ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}
    >
      <Layout style={{ minHeight: '100vh' }}>
        <Sider
          theme={curTheme ? 'dark' : 'light'}
          breakpoint="lg"
          collapsedWidth="0"
          onBreakpoint={(broken) => {}}
          onCollapse={(collapsed, type) => {}}
        >
          <span
            className={styles.logo}
            style={getThemeBg(curTheme)}
          >
            物资后台管理
          </span>
          <Menu
            theme={curTheme ? 'dark' : 'light'}
            mode="inline"
            defaultSelectedKeys={[curActive]}
            items={navList}
            defaultOpenKeys={defaultOpen}
            onSelect={handleSelect}
          />
        </Sider>
        <Layout>
          <Header
            style={{ padding: 0, ...getThemeBg(curTheme), display: 'flex' }}
          >
            <div className={styles.rightControl}>
              <Link
                href={pathname as any}
                locale={otherLocale[0]}
                className={styles.i18n}
                style={{ color: colorTextBase }}
              >
                {otherLocale[1]}
              </Link>
              <span
                onClick={toggleTheme}
                className={styles.theme}
              >
                {!curTheme ? (
                  <SunOutlined style={{ color: colorWarningText }} />
                ) : (
                  <MoonOutlined />
                )}
              </span>
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
          <Content style={{ margin: '24px 16px 0' }}>
            <div
              style={{
                padding: 24,
                height: '100%',
                ...getThemeBg(curTheme),
                borderRadius: borderRadiusLG,
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
