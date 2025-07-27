'use client';
import { useTranslations } from 'next-intl';
import { Table, theme, message } from 'antd';
import { useRouter } from 'next/navigation';
import AvaForm from './AvaForm';
import { columns } from './column';
import Layout from '@/components/Layout';
import styles from './index.module.less';
import { useEffect, useState } from 'react';
import { Warehouse } from './type';
import { queryWareHouse } from './api';
import { getUserAuthorizedWarehouses, getUserRole } from '@/utils/permission';
import { useResponsive } from '@/hooks/useResponsive';
import MobileCardList from '@/components/MobileCardList';
import { EyeOutlined } from '@ant-design/icons';

const PAGE_SIZE = 10;

export default function User() {
  const t = useTranslations('user');
  const { token } = theme.useToken();
  const router = useRouter();
  const { isMobile } = useResponsive();
  const [data, setData] = useState<Warehouse[]>([]);
  const [current, setCurrent] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const [userRole, setUserRole] = useState<{role: number, isAdmin: boolean}>({
    role: 0,
    isAdmin: false
  });
  
  const queryWareHouseData = async (searchParams?: Partial<Warehouse>) => {
    try {
      // 获取用户角色信息
      const roleInfo = await getUserRole();
      setUserRole(roleInfo);

      let warehouses: Warehouse[] = [];
      let totalCount = 0;

      if (roleInfo.isAdmin) {
        // 超级管理员可以看到所有仓库
        const res = await queryWareHouse({
          pageSize: PAGE_SIZE,
          pageNum: current,
          ...searchParams,
        });
        warehouses = res.records;
        totalCount = res.total;
      } else {
        // 普通管理员只能看到有权限的仓库
        const authorizedWarehouses = await getUserAuthorizedWarehouses();
        
        // 如果有搜索条件，进行本地过滤
        if (searchParams && Object.keys(searchParams).length > 0) {
          warehouses = authorizedWarehouses.filter(warehouse => {
            return Object.entries(searchParams).every(([key, value]) => {
              if (!value) return true;
              const warehouseValue = warehouse[key as keyof Warehouse];
              return String(warehouseValue).toLowerCase().includes(String(value).toLowerCase());
            });
          });
        } else {
          warehouses = authorizedWarehouses;
        }

        // 手动分页
        totalCount = warehouses.length;
        const startIndex = (current - 1) * PAGE_SIZE;
        const endIndex = startIndex + PAGE_SIZE;
        warehouses = warehouses.slice(startIndex, endIndex);
      }

      setData(warehouses);
      setTotal(totalCount);

      if (!roleInfo.isAdmin && warehouses.length === 0 && totalCount === 0) {
        message.warning('您暂无任何仓库权限，请联系管理员');
      }
    } catch (error) {
      console.error('获取仓库数据失败:', error);
      message.error('获取仓库数据失败');
    }
  };

  const onPageChange = (page: number, pageSize: number) => {
    setCurrent(page);
  };

  const listStyle: React.CSSProperties = {
    background: 'white',
    border:'1px solid #ddd',
    borderRadius: token.borderRadiusLG,
    padding: 12,
  };

  useEffect(() => {
    queryWareHouseData();
  }, [current]);

  return (
    <Layout curActive="/user">
      <main className={styles.userWrap}>
        <div className={styles.content}>
          <AvaForm onSearch={queryWareHouseData} />
          <div style={listStyle}>
            <h3>
              仓库列表
              {!userRole.isAdmin && (
                <span style={{ fontSize: isMobile ? '12px' : '14px', color: '#666', fontWeight: 'normal', marginLeft: '8px' }}>
                  (仅显示您有权限的仓库)
                </span>
              )}
            </h3>
            
            {isMobile ? (
              <MobileCardList
                items={data.map(warehouse => ({
                  id: warehouse.id,
                  title: warehouse.warehouseName,
                  subtitle: `${warehouse.manageStationName} - ${warehouse.manageRoadName}`,
                  description: `仓库ID: ${warehouse.id}`,
                  tags: [
                    {
                      label: warehouse.status === 0 ? '开启' : '关闭',
                      color: warehouse.status === 0 ? 'green' : 'red'
                    },
                    {
                      label: warehouse.isValid === 1 ? '可用' : '停用',
                      color: warehouse.isValid === 1 ? 'blue' : 'default'
                    }
                  ],
                  actions: [
                    {
                      key: 'view',
                      label: '查看详情',
                      icon: <EyeOutlined />,
                      type: 'primary' as const,
                      onClick: () => router.push(`/home/${warehouse.id}`)
                    }
                  ]
                }))}
                emptyText={userRole.isAdmin ? '暂无仓库数据' : '您暂无仓库权限'}
              />
            ) : (
              <Table
                columns={columns}
                dataSource={data}
                pagination={{
                  pageSize: PAGE_SIZE,
                  current,
                  onChange: onPageChange,
                  total,
                }}
                scroll={{ x: 1000 }}
                size="middle"
              />
            )}
          </div>
        </div>
      </main>
    </Layout>
  );
}
