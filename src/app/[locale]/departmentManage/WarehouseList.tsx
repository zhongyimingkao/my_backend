import { Table, Button, Typography } from 'antd';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const { Title } = Typography;

interface Warehouse {
  id: number;
  warehouseName: string;
  manageStationName: string;
  manageRoadName: string;
  status: number;
  isValid: number;
}

interface WarehouseListProps {
  warehouses: Warehouse[];
  onWarehouseClick: (id: number) => void;
  pagination: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
}

export default function WarehouseList({
  warehouses,
  onWarehouseClick,
  pagination,
}: WarehouseListProps) {
  const router = useRouter();
  const [selectKeys, setSelectKeys] = useState<number[]>([]);

  useEffect(() => {
    if (warehouses) {
      setSelectKeys([warehouses?.[0]?.id]);
    }
  }, [warehouses]);

  const columns = [
    {
      title: '仓库名称',
      dataIndex: 'warehouseName',
      key: 'warehouseName',
      render: (text: string, record: Warehouse) => (
        <a
          onClick={() => {
            onWarehouseClick(record.id);
            setSelectKeys([record.id]);
          }}
        >
          {text}
        </a>
      ),
    },
    {
      title: '所属局',
      dataIndex: 'manageStationName',
      key: 'manageStationName',
    },
    {
      title: '所属路段',
      dataIndex: 'manageRoadName',
      key: 'manageRoadName',
    },
    {
      title: '状态',
      key: 'status',
      render: (record: Warehouse) => (
        <span>{record.status === 0 ? '开启' : '关闭'}</span>
      ),
    },
    {
      title: '是否可用',
      key: 'isValid',
      render: (record: Warehouse) => (
        <span>{record.isValid === 0 ? '禁用' : '可用'}</span>
      ),
    },
  ];

  return (
    <>
      <div style={{ marginBottom: '16px', textAlign: 'right' }}>
        <Button
          type="primary"
          onClick={() => router.push('/storeManage/warehouse')}
        >
          新建仓库
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={warehouses}
        rowKey="id"
        rowSelection={{
          type: 'radio',
          selectedRowKeys: selectKeys,
          onChange: (keys) => {
            setSelectKeys(keys as number[]);
            onWarehouseClick((keys as number[])?.[0]);
          },
        }}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条`,
        }}
      />
    </>
  );
}
