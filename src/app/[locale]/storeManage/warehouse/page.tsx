'use client';
import { useTranslations } from 'next-intl';
import { Button, Space, Table, TableProps, message, theme } from 'antd';
import { useRouter } from 'next/navigation';
import AvaForm from './AvaForm';
import Layout from '@/components/Layout';
import styles from './index.module.less';
import { useEffect, useMemo, useState } from 'react';
import { Warehouse, WarehouseInventory } from './type';
import { queryWareHouse, queryWarehouseInventory } from './api';
import { LeftOutlined } from '@ant-design/icons';

const PAGE_SIZE = 10;

export default function WareHouse() {
  const t = useTranslations('warehouse');
  const { token } = theme.useToken();
  const [data, setData] = useState<Warehouse[]>([]);
  const [current, setCurrent] = useState<number>(1);
  const [warehouseId, setWarehouseId] = useState<number | null>(null);
  const [inventoryData, setInventoryData] = useState<WarehouseInventory[]>();

  const columns: TableProps<Warehouse>['columns'] = [
    {
      title: '仓库编码',
      dataIndex: 'warehouseCode',
      key: 'warehouseCode',
    },
    {
      title: '仓库名称',
      dataIndex: 'warehouseName',
      key: 'warehouseName',
      // render: role => role === 1 ? '超级管理员' : '开发者'
    },
    {
      title: '仓库地址',
      dataIndex: 'warehouseAddr',
      key: 'warehouseAddr',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (value) => {
        if (value === 0) return '未启动';
        return '启动中';
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <a
            onClick={() => {
              setWarehouseId(record.id);
            }}
          >
            查询库存
          </a>
        </Space>
      ),
    },
  ];

  const inventoryColumns: TableProps<WarehouseInventory>['columns'] = [
    {
      title: '物料名称',
      dataIndex: 'materialName',
      key: 'materialName',
    },
    {
      title: '物料方位',
      dataIndex: 'position',
      key: 'position',
    },
    {
      title: '物料库存',
      dataIndex: 'sl',
      key: 'sl',
    },
  ];

  const queryWareHouseData = (searchParams?: Partial<Warehouse>) => {
    queryWareHouse({
      pageSize: PAGE_SIZE,
      pageNum: current,
      ...searchParams,
    }).then((res) => {
      setData(res.records);
    });
  };

  const onPageChange = (page: number, pageSize: number) => {
    setCurrent(page);
  };

  const listStyle: React.CSSProperties = {
    background: token.colorFillAlter,
    borderRadius: token.borderRadiusLG,
    padding: 12,
  };

  useEffect(() => {
    queryWareHouseData();
  }, [current]);

  useEffect(() => {
    if (warehouseId) {
      queryWarehouseInventory(warehouseId)
        .then((res) => {
          setInventoryData(res);
        })
        .catch(() => {
          message.error('库存查询失败');
        });
    }
  }, [warehouseId]);

  const renderContent = useMemo(() => {
    if (!warehouseId) {
      return (
        <>
          <AvaForm onSearch={queryWareHouseData} />
          <div style={listStyle}>
            <h3>仓库主信息列表</h3>
            <Table
              columns={columns}
              dataSource={data}
              pagination={{
                pageSize: PAGE_SIZE,
                current,
                onChange: onPageChange,
              }}
              scroll={{ x: 1000 }}
            />
          </div>
        </>
      );
    } else {
      const curWarehouse = data?.find?.((item) => item?.id === warehouseId);
      return (
        <div className={styles.warehouseInventoryWrap}>
          <Button
            onClick={() => {
              setWarehouseId(null);
            }}
            style={{marginBottom:10}}
          >
            <LeftOutlined />
          </Button>
          <div>仓库编码: {curWarehouse?.warehouseCode}</div>
          <div>仓库名称: {curWarehouse?.warehouseName}</div>
          <div style={listStyle}>
            <h3>仓库库存信息</h3>
            <Table
              columns={inventoryColumns}
              dataSource={inventoryData}
              pagination={false}
              scroll={{ x: 1000 }}
            />
          </div>
        </div>
      );
    }
  }, [warehouseId, data, inventoryData]);

  return (
    <Layout curActive="/storeManage/warehouse" defaultOpen={["/storeManage"]}>
      <main className={styles.warehouseWrap}>
        <div className={styles.content}>{renderContent}</div>
      </main>
    </Layout>
  );
}
