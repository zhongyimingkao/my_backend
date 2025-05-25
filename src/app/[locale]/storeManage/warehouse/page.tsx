'use client';

import { Card, Col, Row, Button, Space, Popconfirm, message } from 'antd';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { queryWareHouse, deleteWareHouse, saveWareHouse } from './api';
import { Warehouse } from './type';
import CommonLayout from '@/components/Layout';
import WarehouseFormModal from './WarehouseFormModal';

const WarehousePage: React.FC = () => {
  const router = useRouter();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const fetchWarehouses = async () => {
    try {
      const res = await queryWareHouse({ pageSize: 100, pageNum: 1 });
      setWarehouses(res.records);
    } catch (error) {
      console.error('Failed to fetch warehouses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (warehouseId: number) => {
    router.push(`/home/${warehouseId}`);
  };

  const handleDelete = async (warehouseId: number) => {
    try {
      await deleteWareHouse(warehouseId);
      message.success('仓库删除成功');
      fetchWarehouses();
    } catch (error) {
      message.error('删除仓库失败');
    }
  };

  const handleSubmit = async (values: Partial<Warehouse>) => {
    try {
      if (editingWarehouse?.id) {
        await saveWareHouse({ ...values, id: editingWarehouse.id });
        message.success('仓库更新成功');
      } else {
        await saveWareHouse(values);
        message.success('仓库创建成功');
      }
      setModalVisible(false);
      setEditingWarehouse(null);
      fetchWarehouses();
    } catch (error) {
      message.error(editingWarehouse?.id ? '更新仓库失败' : '创建仓库失败');
    }
  };

  const handleEdit = (warehouse: Warehouse) => {
    setEditingWarehouse(warehouse);
    setModalVisible(true);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <CommonLayout
      curActive="/storeManage/warehouse"
      defaultOpen={['/storeManage']}
    >
      <div style={{ padding: '24px' }}>
        <div style={{ marginBottom: '16px', textAlign: 'right' }}>
          <Button type="primary" onClick={() => {
            setEditingWarehouse(null);
            setModalVisible(true);
          }}>
            新建仓库
          </Button>
        </div>

        <Row gutter={[16, 16]}>
          {warehouses.map((warehouse) => (
            <Col key={warehouse.id} span={8}>
              <Card
                hoverable
                title={warehouse.warehouseName}
                extra={
                  <Space>
                    <Button 
                    size="small" 
                    onClick={() => handleCardClick(warehouse.id)}
                    >
                      查看详情
                    </Button>
                    <Popconfirm
                      title="删除仓库"
                      description="确定要删除该仓库吗?"
                      onConfirm={() => handleDelete(warehouse.id)}
                      okText="确定"
                      cancelText="取消"
                    >
                      <Button danger size="small">
                        删除
                      </Button>
                    </Popconfirm>
                  </Space>
                }
              >
                <p>所属局：{warehouse.manageStationName}</p>
                <p>所属路段：{warehouse.manageRoadName}</p>
                <p>当前状态: {warehouse.status === 0 ? '开启' : "关闭"}</p>
                <p>是否可用: {warehouse.isValid === 0 ? '禁用' : "可用"}</p>
              </Card>
            </Col>
          ))}
        </Row>

        <WarehouseFormModal
          visible={modalVisible}
          onCancel={() => {
            setModalVisible(false);
            setEditingWarehouse(null);
          }}
          onSubmit={handleSubmit}
          initialValues={editingWarehouse || undefined}
        />
      </div>
    </CommonLayout>
  );
};

export default WarehousePage;