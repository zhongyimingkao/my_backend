'use client';

import {
  Card,
  Button,
  Space,
  Popconfirm,
  message,
  Empty,
  Typography,
  Table,
  List,
} from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  queryWareHouse,
  deleteWareHouse,
  saveWareHouse,
  getWarnWarehouse,
} from './api';
import { Warehouse } from './type';
import CommonLayout from '@/components/Layout';
import WarehouseFormModal from './WarehouseFormModal';
import { queryDepartmentList } from '../../departmentManage/api';
import Loading from '@/components/Loading';
import DepartmentSelector, { SelectedValue, DepartmentData } from '@/components/DepartmentSelector';

const { Title } = Typography;

const WarehousePage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(
    null
  );
  const [departmentData, setDepartmentData] = useState<DepartmentData[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [selectedValue, setSelectedValue] = useState<SelectedValue>({ type: 'all' });

  // 获取告警信息
  const fetchAlerts = async () => {
    try {
      const res = await getWarnWarehouse();
      setAlerts(res || []);
    } catch (error) {
      console.error('获取告警信息失败:', error);
    }
  };

  useEffect(() => {
    fetchDepartmentData();
    fetchAlerts();
    const intervalId = setInterval(fetchAlerts, 30000);
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    if (!departmentData.length) return;

    const deptId = searchParams.get('dept');
    const roadId = searchParams.get('road');

    // 设置选择器的初始值
    if (roadId) {
      const dept = departmentData.find(d => 
        d.roadPOList?.some(r => r.id === Number(roadId))
      );
      const road = dept?.roadPOList?.find(r => r.id === Number(roadId));
      if (dept && road) {
        setSelectedValue({
          type: 'road',
          departmentId: dept.id,
          departmentName: dept.stationName,
          roadId: road.id,
          roadName: road.road
        });
      }
    } else if (deptId) {
      const dept = departmentData.find(d => d.id === Number(deptId));
      if (dept) {
        setSelectedValue({
          type: 'department',
          departmentId: dept.id,
          departmentName: dept.stationName
        });
      }
    } else {
      setSelectedValue({ type: 'all' });
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

  const fetchWarehouses = async (
    params: { manageStation?: number; manageRoad?: number } = {}
  ) => {
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

  // 处理选择器变化
  const handleSelectorChange = (value: SelectedValue) => {
    setSelectedValue(value);

    if (value.type === 'all') {
      router.push('/storeManage/warehouse');
    } else if (value.type === 'department') {
      router.push(`/storeManage/warehouse?dept=${value.departmentId}`);
    } else if (value.type === 'road') {
      router.push(`/storeManage/warehouse?road=${value.roadId}`);
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

  // 表格列定义
  const columns = [
    {
      title: '仓库名称',
      dataIndex: 'warehouseName',
      key: 'warehouseName',
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
    {
      title: '操作',
      key: 'action',
      render: (record: Warehouse) => (
        <Space>
          <Button
            size="small"
            onClick={() => handleCardClick(record.id)}
          >
            查看详情
          </Button>
          <Popconfirm
            title="删除仓库"
            description="确定要删除该仓库吗?"
            onConfirm={() => handleDelete(record.id)}
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
      ),
    },
  ];

  if (loading) {
    return <Loading />;
  }

  return (
    <CommonLayout
      curActive="/storeManage/warehouse"
      defaultOpen={['/storeManage']}
    >
      {/* 部门路段选择器 */}
      <div style={{ marginBottom: 16, marginLeft: 24 }}>
        <DepartmentSelector
          departmentData={departmentData}
          value={selectedValue}
          onChange={handleSelectorChange}
          placeholder="请选择局-路段"
        />
      </div>

      <div style={{ padding: '24px', height: 'calc(100vh - 160px)' }}>
        <div style={{ display: 'flex', gap: 24 }}>
          {/* 仓库表格 */}
          <Card
            title="仓库列表"
            style={{ flex: 2 }}
            bodyStyle={{ padding: 0 }}
            extra={
              // 将新建仓库按钮作为Card的extra属性
              <Button
                type="primary"
                onClick={() => {
                  setEditingWarehouse(null);
                  setModalVisible(true);
                }}
              >
                新建仓库
              </Button>
            }
          >
            {warehouses.length > 0 ? (
              <Table
                dataSource={warehouses}
                columns={columns}
                rowKey="id"
                pagination={false}
              />
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="暂无仓库数据"
              />
            )}
          </Card>

          {/* 告警信息栏目 */}
          <Card
            title="告警信息"
            bordered={false}
            style={{ flex: 1 }}
            headStyle={{
              backgroundColor: '#1890ff',
              borderBottom: '1px solid #40a9ff',
              color: '#fff',
              fontWeight: 600,
            }}
            bodyStyle={{
              padding: 0,
              maxHeight: '600px',
              overflowY: 'auto',
              backgroundColor: '#fafafa',
            }}
          >
            {alerts.length > 0 ? (
              <List
                dataSource={alerts}
                renderItem={(alert) => (
                  <List.Item
                    style={{
                      padding: '10px 16px',
                      borderBottom: '1px solid #e6f7ff',
                      backgroundColor: '#f0f9ff',
                      borderRadius: '4px',
                      boxShadow: '0 1px 3px rgba(24, 144, 255, 0.2)',
                    }}
                  >
                    <List.Item.Meta
                      title={
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          {alert.sl <= alert.threshold && (
                            <span style={{ color: '#1890ff', marginRight: 8 }}>
                              ⚠️
                            </span>
                          )}
                          <span style={{ fontWeight: 500 }}>
                            {alert.warehouseName} - {alert.materialName}
                          </span>
                        </div>
                      }
                      description={
                        <div style={{ fontSize: '12px' }}>
                          <div>位置: {alert.position}</div>
                          <div>
                            库存:
                            <span
                              style={{
                                color:
                                  alert.sl <= alert.threshold
                                    ? '#f5222d'
                                    : '#52c41a',
                                fontWeight:
                                  alert.sl <= alert.threshold ? 600 : 'normal',
                              }}
                            >
                              {alert.sl}
                            </span>
                            / 预警值: {alert.threshold}
                          </div>
                          <div>单位: {alert.unit}</div>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="暂无告警信息"
                style={{ padding: '40px 0', backgroundColor: '#fafafa' }}
              />
            )}
          </Card>
        </div>
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