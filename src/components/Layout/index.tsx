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
  Input,
  Modal,
  Form,
  message,
} from 'antd';
import { getCommonNavList, getHomeNavList } from './menu';
import {
  useParams,
  useRouter,
  usePathname,
  useSearchParams,
} from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import styles from './index.module.less';
import { useAtom } from 'jotai';
import { userInfo, warehouseInfo } from '@/app/[locale]/store';
import zhCN from 'antd/locale/zh_CN';
import { queryWareHouse } from '@/app/[locale]/user/api';
import { queryDepartmentList } from '@/app/[locale]/departmentManage/api';
import { updateUserInfo as updateUserInfoApi } from '@/app/[locale]/userManage/webUserManage/api';

const { Header, Content } = Layout;

interface IProps {
  children: React.ReactNode;
  curActive: string;
  defaultOpen?: string[];
}

const CommonLayout: React.FC<IProps> = ({ children, curActive }) => {
  const {
    token: { borderRadiusLG, colorTextBase, colorWarningText },
  } = theme.useToken();

  const t = useTranslations('global');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [curUserInfo] = useAtom(userInfo);
  const isSuperAdmin = curUserInfo?.data?.role === 2;
  const [curWarehouseInfo, setWarehouseInfo] = useAtom(warehouseInfo);
  const { warehouseID } = useParams();
  const [departmentTree, setDepartmentTree] = useState<any[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [changePwdVisible, setChangePwdVisible] = useState(false);
  const [pwdForm] = Form.useForm();

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
    {
      key: '2',
      label: (
        <a
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => {
            setChangePwdVisible(true);
          }}
        >
          修改密码
        </a>
      ),
    },
  ];

  const updateUserInfo = async () => {
    if (!warehouseID) {
      setWarehouseInfo(null);
      return;
    }
    const res = await queryWareHouse();
    const curInfo = res.records.find((item) => item.id === Number(warehouseID));
    setWarehouseInfo(curInfo);
  };

  const searchParams = useSearchParams();
  const deptId = searchParams.get('dept');
  const roadId = searchParams.get('road');

  useEffect(() => {
    // 设置菜单高亮状态
    if (deptId && roadId) {
      setSelectedKeys([`/storeManage/warehouse?dept=${deptId}&road=${roadId}`]);
    } else if (deptId) {
      setSelectedKeys([`/storeManage/warehouse?dept=${deptId}`]);
    }
  }, [searchParams]);

  const fetchDepartmentData = async () => {
    try {
      const data = await queryDepartmentList();
      const nodes = data.map((dept) => {
        const children =
          dept.roadPOList?.map((road) => ({
            key: `road_${road.id}`,
            label: road.road,
          })) || [];

        return {
          key: `station_${dept.id}`,
          label: dept.stationName,
          ...(children.length > 0 ? { children } : {}),
        };
      });
      setDepartmentTree(nodes);
    } catch (error) {
      console.error('Failed to fetch department data:', error);
    }
  };

  useEffect(() => {
    updateUserInfo();
    fetchDepartmentData();
  }, [warehouseID, pathname]);

  const generateDynamicMenu = () => {
    const commonNavList = getCommonNavList(t, isSuperAdmin);
    return commonNavList;
  };

  const navList =
    !!warehouseID && warehouseID !== 'all'
      ? getHomeNavList(t)
      : generateDynamicMenu();

  const handleSelect = (row: { key: string }) => {
    const path = warehouseID
      ? row.key.replace(':warehouseID', warehouseID as string)
      : row.key;
    router.push(path);
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1890ff', /* 主色 - 蓝色 */
          colorSuccess: '#52c41a', /* 成功色/选中色 - 绿色 */
          colorBgContainer: '#ffffff', /* 容器背景色 - 白色 */
          colorBgLayout: '#ffffff', /* 布局背景色 - 白色 */
          colorText: '#2c3e50',
          colorTextSecondary: '#4a5b6c',
          colorBorder: '#8fb3d5',
          colorBorderSecondary: '#b0c9e2',
          borderRadius: 6,
          wireframe: false,
        },
        components: {
          Layout: {
            headerBg: '#1890ff', /* 表头背景色 - 蓝色 */
            bodyBg: '#fff', /* 内容区域背景色 - 白色 */
          },
          Menu: {
            itemColor: '#ffffff',
            itemHoverColor: '#ffffff',
            itemHoverBg: '#40a9ff', /* 菜单项悬停背景色 - 浅蓝色 */
            itemSelectedColor: '#ffffff',
            itemSelectedBg: '#52c41a', /* 菜单项选中背景色 - 绿色 */
            itemActiveBg: '#52c41a',
            horizontalItemSelectedColor: '#ffffff',
            horizontalItemHoverColor: '#ffffff',
            horizontalItemHoverBg: '#40a9ff',
            horizontalItemSelectedBg: '#52c41a',
            subMenuItemBg: '#1890ff',
            popupBg: '#1890ff',
          },
          Button: {
            defaultBg: '#ffffff',
            defaultBorderColor: '#8fb3d5',
            defaultColor: '#1890ff',
            linkHoverBg: '#52c41a',
          },
          Table: {
            headerBg: '#fafafa', /* 表头背景色 - 淡灰色 */
            headerColor: '#666',
            borderColor: '#eeeeee',
            rowHoverBg: 'rgba(24, 144, 255, 0.1)',
          },
          Badge: {
            colorBgBase: '#52c41a',
          },
        },
      }}
      locale={zhCN}
    >
      <Modal
        title="修改密码"
        open={changePwdVisible}
        onCancel={() => setChangePwdVisible(false)}
        onOk={() => {
          pwdForm
            .validateFields()
            .then((values) => {
              console.log(values);
              updateUserInfoApi({
                ...curUserInfo?.data,
                password: values.newPassword,
              })
                .then(() => {
                  message.success('密码修改成功');
                  localStorage.setItem('token', '');
                  location.href = '/user/login';
                })
                .catch(() => {
                  message.error('密码修改失败');
                });
            })
            .catch((info) => {
              console.log('Validate Failed:', info);
            });
        }}
      >
        <Form
          form={pwdForm}
          layout="vertical"
        >
          <Form.Item
            name="newPassword"
            label="新密码"
            rules={[
              {
                required: true,
                message: '请输入新密码',
              },
            ]}
            hasFeedback
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="确认密码"
            dependencies={['newPassword']}
            hasFeedback
            rules={[
              {
                required: true,
                message: '请确认新密码',
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject('两次输入的密码不一致');
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>
        </Form>
      </Modal>
      <Layout style={{ minHeight: '100vh' }}>
        <Layout>
          <Header
            style={{
              padding: 0,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#1a5f9c',
            }}
          >
            <div className={styles.leftControl}>
              <Tooltip title="点击返回首页">
                <span
                  className={styles.logo}
                  onClick={() => {
                    router.push('/');
                  }}
                  style={{
                    color: '#fff',
                    fontWeight: 'bold',
                    fontSize: '18px',
                    padding: '0 16px',
                    cursor: 'pointer',
                  }}
                >
                  {curWarehouseInfo
                    ? '当前仓库：' + curWarehouseInfo.warehouseName
                    : '物资后台管理'}
                </span>
              </Tooltip>

              <Menu
                style={{
                  flex: 1,
                  backgroundColor: '#1a5f9c',
                  color: '#ffffff',
                  borderBottom: 'none',
                }}
                mode="horizontal"
                selectedKeys={
                  selectedKeys.length > 0 ? selectedKeys : [curActive]
                }
                items={navList}
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
          <Content style={{}}>
            <div
              style={{
                height: '100%',
                borderRadius: borderRadiusLG,
                padding: '24px 16px',
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
