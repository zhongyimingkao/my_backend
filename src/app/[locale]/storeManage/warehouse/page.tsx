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
  Tabs,
  Tag,
  Row,
  Col,
  Statistic,
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
import { getUserAuthorizedWarehouses, getUserRole } from '@/utils/permission';
import { queryPageOutbound } from '../common/api';
import {
  EyeOutlined,
  WarningOutlined,
  DatabaseOutlined,
  ShopOutlined,
} from '@ant-design/icons';

const { Title } = Typography;
const { TabPane } = Tabs;

interface DepartmentData {
  id: number;
  stationName: string;
  roadPOList?: {
    id: number;
    road: string;
  }[];
}

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
  const [outboundRecords, setOutboundRecords] = useState<any[]>([]);
  const [warehouseStats, setWarehouseStats] = useState({ active: 0, noNeedCheck: 0 });
  const [selectedDepartment, setSelectedDepartment] =
    useState<DepartmentData | null>(null);
  const [selectedRoad, setSelectedRoad] = useState<{
    id: number;
    road: string;
  } | null>(null);
  const [userRole, setUserRole] = useState<{ role: number; isAdmin: boolean }>({
    role: 0,
    isAdmin: false,
  });

  // 获取告警信息
  const fetchAlerts = async () => {
    try {
      const res = await getWarnWarehouse();
      setAlerts(res || []);
    } catch (error) {
      console.error('获取告警信息失败:', error);
    }
  };

  // 获取出库动态
  const fetchOutboundRecords = async () => {
    try {
      const res = await queryPageOutbound({
        pageSize: 5,
        pageNum: 1,
      });
      setOutboundRecords(res.records || []);
    } catch (error) {
      console.error('获取出库动态失败:', error);
    }
  };

  // 获取仓库统计
  const fetchWarehouseStats = async () => {
    try {
      const roleInfo = await getUserRole();
      let allWarehouses: Warehouse[] = [];

      if (roleInfo.isAdmin) {
        const res = await queryWareHouse({
          pageSize: 1000,
          pageNum: 1,
        });
        allWarehouses = res.records;
      } else {
        allWarehouses = await getUserAuthorizedWarehouses();
      }

      const active = allWarehouses.filter(w => w.isValid === 1).length;
      const noNeedCheck = allWarehouses.filter(w => w.isNeedCheck === 1).length;
      setWarehouseStats({ active, noNeedCheck });
    } catch (error) {
      console.error('获取仓库统计失败:', error);
    }
  };

  useEffect(() => {
    fetchDepartmentData();
    if (userRole.isAdmin) {
      fetchAlerts();
      fetchOutboundRecords();
      fetchWarehouseStats();
      const intervalId = setInterval(() => {
        fetchAlerts();
        fetchOutboundRecords();
        fetchWarehouseStats();
      }, 30000);
      return () => {
        clearInterval(intervalId);
      };
    }
  }, [userRole.isAdmin]);

  useEffect(() => {
    if (!departmentData.length) return;

    const deptId = searchParams.get('dept');
    const roadId = searchParams.get('road');

    if (roadId) {
      const dept = departmentData.find((d) =>
        d.roadPOList?.some((r) => r.id === Number(roadId))
      );
      const road = dept?.roadPOList?.find((r) => r.id === Number(roadId));
      if (dept && road) {
        setSelectedDepartment(dept);
        setSelectedRoad(road);
      }
    } else if (deptId) {
      const dept = departmentData.find((d) => d.id === Number(deptId));
      if (dept) {
        setSelectedDepartment(dept);
        setSelectedRoad(null);
      }
    } else {
      setSelectedDepartment(null);
      setSelectedRoad(null);
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
      // 获取用户角色信息
      const roleInfo = await getUserRole();
      setUserRole(roleInfo);

      let warehouseList: Warehouse[] = [];

      if (roleInfo.isAdmin) {
        // 超级管理员可以看到所有仓库
        const res = await queryWareHouse({
          ...params,
          pageSize: 100,
          pageNum: 1,
        });
        warehouseList = res.records;
      } else {
        // 普通管理员只能看到有权限的仓库
        const authorizedWarehouses = await getUserAuthorizedWarehouses();

        // 根据选择的部门/路段过滤
        warehouseList = authorizedWarehouses.filter((warehouse) => {
          if (
            params.manageStation &&
            warehouse.manageStation !== params.manageStation
          ) {
            return false;
          }
          if (params.manageRoad && warehouse.manageRoad !== params.manageRoad) {
            return false;
          }
          return true;
        });

        if (warehouseList.length === 0 && authorizedWarehouses.length === 0) {
          message.warning('您暂无任何仓库权限，请联系管理员');
        }
      }

      setWarehouses(warehouseList);
    } catch (error) {
      console.error('Failed to fetch warehouses:', error);
    } finally {
      setLoading(false);
    }
  };

  // 处理部门选择
  const handleDepartmentSelect = (dept: DepartmentData) => {
    setSelectedDepartment(dept);
    setSelectedRoad(null);
    router.push(`/storeManage/warehouse?dept=${dept.id}`);
  };

  // 处理路段选择
  const handleRoadSelect = (road: { id: number; road: string }) => {
    setSelectedRoad(road);
    router.push(`/storeManage/warehouse?road=${road.id}`);
  };

  // 重置选择 - 选择全部
  const handleSelectAll = () => {
    setSelectedDepartment(null);
    setSelectedRoad(null);
    router.push('/storeManage/warehouse');
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
        <Tag color={record.status === 0 ? 'green' : 'red'}>
          {record.status === 0 ? '开启' : '关闭'}
        </Tag>
      ),
    },
    {
      title: '是否可用',
      key: 'isValid',
      render: (record: Warehouse) => (
        <Tag color={record.isValid === 1 ? 'blue' : 'default'}>
          {record.isValid === 1 ? '可用' : '停用'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (record: Warehouse) => (
        <Space>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleCardClick(record.id)}
          >
            查看详情
          </Button>
          {userRole.isAdmin && (
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
          )}
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
      <div style={{ padding: '24px' }}>
        {/* 部门路段选择区域 */}
        <Card style={{ marginBottom: 24 }}>
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  marginBottom: 16,
                }}
              >
                <Title
                  level={4}
                  style={{ margin: 0 }}
                >
                  选择局段
                </Title>
                {/* 移除重置按钮，因为已经有"全部"选项 */}
              </div>
            </Col>
            {/* 局选择 */}
            <Col span={24}>
              <div style={{ marginBottom: 16 }}>
                <Title level={5}>选择局：</Title>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {/* 全部选项 */}
                  <Button
                    type={!selectedDepartment ? 'primary' : 'default'}
                    onClick={handleSelectAll}
                    style={{ marginBottom: 8 }}
                  >
                    全部
                  </Button>
                  {departmentData.map((dept) => (
                    <Button
                      key={dept.id}
                      type={
                        selectedDepartment?.id === dept.id
                          ? 'primary'
                          : 'default'
                      }
                      onClick={() => handleDepartmentSelect(dept)}
                      style={{ marginBottom: 8 }}
                    >
                      {dept.stationName}
                    </Button>
                  ))}
                </div>
              </div>
            </Col>
            {/* 路段选择 */}
            {selectedDepartment && selectedDepartment.roadPOList && (
              <Col span={24}>
                <div>
                  <Title level={5}>选择路段：</Title>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {selectedDepartment.roadPOList.map((road) => (
                      <Button
                        key={road.id}
                        type={
                          selectedRoad?.id === road.id ? 'primary' : 'default'
                        }
                        onClick={() => handleRoadSelect(road)}
                        style={{ marginBottom: 8 }}
                      >
                        {road.road}
                      </Button>
                    ))}
                  </div>
                </div>
              </Col>
            )}
          </Row>
        </Card>

        <div style={{ display: 'flex', gap: 24 }}>
          {/* 仓库列表 */}
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>仓库列表</span>
                {selectedDepartment && (
                  <Tag color="blue">{selectedDepartment.stationName}</Tag>
                )}
                {selectedRoad && <Tag color="green">{selectedRoad.road}</Tag>}
                {!userRole.isAdmin && (
                  <span
                    style={{
                      fontSize: '14px',
                      color: '#666',
                      fontWeight: 'normal',
                    }}
                  >
                    (仅显示您有权限的仓库)
                  </span>
                )}
              </div>
            }
            style={{ flex: userRole.isAdmin ? 2 : 1 }}
            bodyStyle={{ padding: 0 }}
            extra={
              userRole.isAdmin && (
                <Button
                  type="primary"
                  onClick={() => {
                    setEditingWarehouse(null);
                    setModalVisible(true);
                  }}
                >
                  新建仓库
                </Button>
              )
            }
          >
            {warehouses.length > 0 ? (
              <Table
                dataSource={warehouses}
                columns={columns}
                rowKey="id"
                pagination={{ pageSize: 10 }}
              />
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  userRole.isAdmin ? '暂无仓库数据' : '您暂无仓库权限'
                }
              />
            )}
          </Card>

          {/* 右侧信息栏 - 仅超级管理员可见 */}
          {userRole.isAdmin && (
            <Card
              style={{ flex: 1, minWidth: 400 }}
              bodyStyle={{ padding: 0 }}
            >
              <Tabs
                defaultActiveKey="1"
                style={{ padding: '0 16px' }}
              >
                <TabPane
                  tab={
                    <span>
                      <WarningOutlined />
                      告警信息
                    </span>
                  }
                  key="1"
                >
                  <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                    {alerts.length > 0 ? (
                      <List
                        dataSource={alerts}
                        renderItem={(alert) => (
                          <List.Item style={{ padding: '12px 0' }}>
                            <List.Item.Meta
                              avatar={
                                <WarningOutlined style={{ color: '#ff4d4f' }} />
                              }
                              title={
                                <span style={{ fontWeight: 500 }}>
                                  {alert.warehouseName} - {alert.materialName}
                                </span>
                              }
                              description={
                                <div style={{ fontSize: '12px' }}>
                                  <div>
                                    库存:
                                    <span
                                      style={{
                                        color:
                                          alert.sl <= alert.threshold
                                            ? '#ff4d4f'
                                            : '#52c41a',
                                        fontWeight: 'bold',
                                      }}
                                    >
                                      {alert.sl}
                                    </span>{' '}
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
                      <Empty description="暂无告警信息" />
                    )}
                  </div>
                </TabPane>

                <TabPane
                  tab={
                    <span>
                      <DatabaseOutlined />
                      出库动态
                    </span>
                  }
                  key="2"
                >
                  <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                    {outboundRecords.length > 0 ? (
                      <List
                        dataSource={outboundRecords}
                        renderItem={(record) => (
                          <List.Item
                            style={{ padding: '12px 0' }}
                            actions={[
                              <Button
                                key="btn"
                                type="link"
                                size="small"
                                onClick={() =>
                                  router.push('/storeManage/out/all')
                                }
                              >
                                查看详情
                              </Button>,
                            ]}
                          >
                            <List.Item.Meta
                              title={
                                <span>
                                  {record.warehouseName} - {record.djbh}
                                </span>
                              }
                              description={
                                <div style={{ fontSize: '12px' }}>
                                  <div>
                                    出库人:{' '}
                                    {record.creatorName || record.wxCreatorName}
                                  </div>
                                  <div>出库时间: {record.ckTime}</div>
                                  <div>
                                    状态:
                                    <Tag
                                      color={
                                        record.status === 1
                                          ? 'green'
                                          : record.status === 0
                                          ? 'orange'
                                          : 'red'
                                      }
                                    >
                                      {record.status === 1
                                        ? '已审核'
                                        : record.status === 0
                                        ? '待审核'
                                        : '审核失败'}
                                    </Tag>
                                  </div>
                                </div>
                              }
                            />
                          </List.Item>
                        )}
                      />
                    ) : (
                      <Empty description="暂无出库动态" />
                    )}
                  </div>
                </TabPane>

                <TabPane
                  tab={
                    <span>
                      <ShopOutlined />
                      仓库情况
                    </span>
                  }
                  key="3"
                >
                  <div style={{ padding: '16px 0' }}>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Card size="small">
                          <Statistic
                            title="在用仓库"
                            value={warehouseStats.active}
                            valueStyle={{ color: '#3f8600' }}
                            suffix="个"
                          />
                        </Card>
                      </Col>
                      <Col span={12}>
                        <Card size="small">
                          <Statistic
                            title="免审核仓库"
                            value={warehouseStats.noNeedCheck}
                            valueStyle={{ color: '#1890ff' }}
                            suffix="个"
                          />
                        </Card>
                      </Col>
                    </Row>
                    <div style={{ marginTop: 16, textAlign: 'center' }}>
                      {/* 移除查看所有仓库按钮 */}
                    </div>
                  </div>
                </TabPane>
              </Tabs>
            </Card>
          )}
        </div>
      </div>

      {userRole.isAdmin && (
        <WarehouseFormModal
          visible={modalVisible}
          onCancel={() => {
            setModalVisible(false);
            setEditingWarehouse(null);
          }}
          onSubmit={handleSubmit}
          initialValues={editingWarehouse || undefined}
        />
      )}
    </CommonLayout>
  );
};

export default WarehousePage;
