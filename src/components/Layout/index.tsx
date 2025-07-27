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
  Drawer,
  Button,
} from 'antd';
import { MenuOutlined } from '@ant-design/icons';
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
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
  const [pwdForm] = Form.useForm();
  
  // 使用响应式Hook
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);

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
    const commonNavList = getCommonNavList(t, isSuperAdmin, isMobile);
    return commonNavList;
  };

  const navList =
    !!warehouseID && warehouseID !== 'all'
      ? getHomeNavList(t, isMobile)
      : generateDynamicMenu();

  const handleSelect = (row: { key: string }) => {
    const path = warehouseID
      ? row.key.replace(':warehouseID', warehouseID as string)
      : row.key;
    router.push(path);
    // 移动端选择菜单后关闭抽屉
    if (isMobile) {
      setMobileMenuVisible(false);
    }
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
              height: isMobile ? '56px' : '64px',
              overflow: 'hidden',
            }}
          >
            <div className={styles.leftControl}>
              {/* 移动端菜单按钮 */}
              {isMobile && (
                <Button
                  type="text"
                  icon={<MenuOutlined />}
                  onClick={() => setMobileMenuVisible(true)}
                  style={{
                    color: '#fff',
                    border: 'none',
                    marginLeft: '8px',
                    fontSize: '18px',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                />
              )}
              
              <Tooltip title="点击返回首页">
                <div
                  className={styles.logo}
                  onClick={() => {
                    router.push('/');
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: isMobile ? '0 8px' : '0 16px',
                    cursor: 'pointer',
                    flex: isMobile ? 1 : 'none',
                    minWidth: 0,
                  }}
                >
                  {curWarehouseInfo ? (
                    <span
                      style={{
                        color: '#fff',
                        fontWeight: 'bold',
                        fontSize: isMobile ? '14px' : '18px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {isMobile ? curWarehouseInfo.warehouseName : `当前仓库：${curWarehouseInfo.warehouseName}`}
                    </span>
                  ) : (
                    <img
                      src="/gonglu.png"
                      alt="公路管理系统"
                      style={{
                        height: isMobile ? '32px' : '40px',
                        maxWidth: isMobile ? '120px' : '200px',
                        objectFit: 'contain',
                      }}
                    />
                  )}
                </div>
              </Tooltip>

              {/* 桌面端菜单 */}
              {!isMobile && (
                <Menu
                  style={{
                    flex: 1,
                    backgroundColor: '#1a5f9c',
                    color: '#ffffff',
                    borderBottom: 'none',
                    minWidth: 0,
                  }}
                  mode="horizontal"
                  selectedKeys={
                    selectedKeys.length > 0 ? selectedKeys : [curActive]
                  }
                  items={navList}
                  onSelect={handleSelect}
                />
              )}
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
                    size={isMobile ? 'small' : 'default'}
                  >
                    Admin
                  </Avatar>
                </Dropdown>
              </div>
            </div>
          </Header>

          {/* 移动端抽屉菜单 */}
          <Drawer
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <img
                  src="/gonglu.png"
                  alt="logo"
                  style={{ height: '24px', objectFit: 'contain' }}
                />
                <span style={{ fontSize: '16px', fontWeight: 'bold' }}>系统菜单</span>
              </div>
            }
            placement="left"
            onClose={() => setMobileMenuVisible(false)}
            open={mobileMenuVisible}
            width={280}
            styles={{
              header: {
                background: '#1a5f9c',
                color: '#fff',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              },
              body: {
                padding: 0,
                background: '#f8f9fa',
              },
            }}
          >
            <div style={{ padding: '16px 0' }}>
              {/* 用户信息区域 */}
              <div style={{ 
                padding: '16px 24px', 
                background: '#fff', 
                marginBottom: '8px',
                borderBottom: '1px solid #f0f0f0'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Avatar
                    style={{ backgroundColor: '#1a5f9c' }}
                    size="large"
                  >
                    Admin
                  </Avatar>
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
                      {curUserInfo?.data?.loginName || 'Admin'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {isSuperAdmin ? '超级管理员' : '管理员'}
                    </div>
                  </div>
                </div>
              </div>

              {/* 当前仓库信息 */}
              {curWarehouseInfo && (
                <div style={{ 
                  padding: '12px 24px', 
                  background: '#e6f7ff', 
                  marginBottom: '8px',
                  borderLeft: '4px solid #1890ff'
                }}>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                    当前仓库
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#1890ff' }}>
                    {curWarehouseInfo.warehouseName}
                  </div>
                </div>
              )}

              {/* 菜单列表 - 移动端优化版本 */}
              {navList && navList.length > 0 ? (
                <div style={{ padding: '8px 0' }}>
                  {navList.map((item: any) => (
                    <div key={item.key} style={{ marginBottom: '4px' }}>
                      {/* 主菜单项 */}
                      <div
                        onClick={() => {
                          if (!item.children) {
                            handleSelect({ key: item.key });
                          }
                        }}
                        style={{
                          padding: '12px 24px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          cursor: 'pointer',
                          backgroundColor: curActive === item.key ? '#e6f7ff' : 'transparent',
                          borderLeft: curActive === item.key ? '4px solid #1890ff' : '4px solid transparent',
                          transition: 'all 0.2s',
                        }}
                      >
                        <span style={{ fontSize: '16px', color: '#1890ff' }}>
                          {item.icon}
                        </span>
                        <span style={{ 
                          fontSize: '14px', 
                          fontWeight: curActive === item.key ? 'bold' : 'normal',
                          color: curActive === item.key ? '#1890ff' : '#333',
                          flex: 1
                        }}>
                          {item.label}
                        </span>
                        {item.children && (
                          <span style={{ fontSize: '12px', color: '#999' }}>
                            ▶
                          </span>
                        )}
                      </div>
                      
                      {/* 子菜单项 */}
                      {item.children && (
                        <div style={{ 
                          backgroundColor: '#f8f9fa',
                          borderLeft: '4px solid #e6f7ff'
                        }}>
                          {item.children.map((child: any) => (
                            <div
                              key={child.key}
                              onClick={() => handleSelect({ key: child.key })}
                              style={{
                                padding: '10px 24px 10px 48px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                cursor: 'pointer',
                                backgroundColor: curActive === child.key ? '#e6f7ff' : 'transparent',
                                borderLeft: curActive === child.key ? '3px solid #1890ff' : '3px solid transparent',
                                transition: 'all 0.2s',
                              }}
                            >
                              <span style={{ fontSize: '14px', color: '#1890ff' }}>
                                {child.icon}
                              </span>
                              <span style={{ 
                                fontSize: '13px',
                                fontWeight: curActive === child.key ? 'bold' : 'normal',
                                color: curActive === child.key ? '#1890ff' : '#666',
                                lineHeight: '1.2',
                                wordBreak: 'break-all'
                              }}>
                                {child.label}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '16px 24px', textAlign: 'center', color: '#666' }}>
                  <div>菜单加载中...</div>
                  <div style={{ fontSize: '12px', marginTop: '8px' }}>
                    调试信息: warehouseID={warehouseID}, isSuperAdmin={isSuperAdmin}
                  </div>
                </div>
              )}
            </div>
          </Drawer>
          <Content style={{}}>
            <div
              style={{
                height: '100%',
                borderRadius: borderRadiusLG,
                padding: isMobile ? '16px 8px' : '24px 16px',
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
