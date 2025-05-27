'use client';

import { Card, Col, Row, Button, Space, Popconfirm, message, Empty, Typography, Tag } from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { queryWareHouse, deleteWareHouse, saveWareHouse } from './api';
import { Warehouse } from './type';
import CommonLayout from '@/components/Layout';
import WarehouseFormModal from './WarehouseFormModal';
import { queryDepartmentList } from '../../departmentManage/api';

const { Title } = Typography;

const WarehousePage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
  const [currentSelection, setCurrentSelection] = useState<string>('全部');
  const [departmentData, setDepartmentData] = useState<any[]>([]);

  useEffect(() => {
    fetchDepartmentData();
  }, []);

  useEffect(() => {
    const deptId = searchParams.get('dept');
    const roadId = searchParams.get('road');
    console.log('departmentData',departmentData);
    // 设置当前选择显示
    if (deptId && roadId) {
      const dept = departmentData.find(d => d.id === Number(deptId));
      const road = dept?.roadPOList?.find(r => r.id === Number(roadId));
      if (dept && road) {
        setCurrentSelection(`当前：${dept.stationName} - ${road.road}`);
      }
    } else if (deptId) {
      const dept = departmentData.find(d => d.id === Number(deptId));
      if (dept) {
        setCurrentSelection(`当前：${dept.stationName}`);
      }
    } else {
      setCurrentSelection('全部');
    }
    
    // 获取仓库数据
    const params: { manageStation?: number; manageRoad?: number } = {};
    if (deptId) params.manageStation = Number(deptId);
    if (roadId) params.manageRoad = Number(roadId);
    
    fetchWarehouses(params);
  }, [searchParams, departmentData]);

  const fetchDepartmentData = async () => {
    try {
      const data = await queryDepartmentList();
      setDepartmentData(data);
    } catch (error) {
      console.error('Failed to fetch department data:', error);
    }
  };

  const fetchWarehouses = async (params: { manageStation?: number; manageRoad?: number } = {}) => {
    try {
      const res = await queryWareHouse({
        ...params,
        pageSize: 100,
        pageNum: 1,
      });
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

  if (loading) {
    return <Empty />;
  }

  return (
    <CommonLayout
      curActive="/storeManage/warehouse"
      defaultOpen={['/storeManage']}
    >
      <div style={{ marginBottom: 16 }}>
        <Tag color="blue" style={{ fontSize: 16, padding: '8px 16px' }}>
          {currentSelection}
        </Tag>
      </div>
      
      <div style={{ padding: '24px' }}>
        {warehouses.length > 0 ? (
          <>
            <div style={{ marginBottom: '16px', textAlign: 'right' }}>
              <Button
                type="primary"
                onClick={() => {
                  setEditingWarehouse(null);
                  setModalVisible(true);
                }}
              >
                新建仓库
              </Button>
            </div>

            <Row gutter={[16, 16]}>
              {warehouses.map((warehouse) => (
                <Col
                  key={warehouse.id}
                  span={8}
                >
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
                          <Button
                            danger
                            size="small"
                          >
                            删除
                          </Button>
                        </Popconfirm>
                      </Space>
                    }
                  >
                    <p>所属局：{warehouse.manageStationName}</p>
                    <p>所属路段：{warehouse.manageRoadName}</p>
                    <p>当前状态: {warehouse.status === 0 ? '开启' : '关闭'}</p>
                    <p>是否可用: {warehouse.isValid === 0 ? '禁用' : '可用'}</p>
                  </Card>
                </Col>
              ))}
            </Row>
          </>
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="暂无仓库数据"
          />
        )}
      </div>

      <WarehouseFormModal
        visible={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingWarehouse(null);
        }}
        onSubmit={handleSubmit}
        initialValues={editingWarehouse || undefined}
      />
    </CommonLayout>
  );
};

export default WarehousePage;
