'use client';
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Spin,
  Switch,
  Table,
  Typography,
  Empty,
  List,
  Statistic,
  Image,
} from 'antd';
import { QrcodeOutlined } from '@ant-design/icons';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  deleteWareHouse,
  getWarehouseManagers,
  queryWareHouse,
  queryWarehouseInventory,
  saveWareHouse,
} from '../../storeManage/warehouse/api';
import Layout from '@/components/Layout';
import { Warehouse } from '../../user/type';
import { updateUserInfo } from '../../userManage/webUserManage/api';
import { userInfo } from '../../store';
import { useAtom } from 'jotai';
import WarehouseFormModal from '../../storeManage/warehouse/WarehouseFormModal';
import { StoreOut } from '../../storeManage/common/type';
import {
  checkOutBound,
  queryPageInbound,
  queryPageOutbound,
} from '../../storeManage/common/api';
import { queryPageOutDetail } from '../../storeManage/common/api';

const { Title, Text } = Typography;

const statusMap = new Map<number, string>([
  [0, '待审核'],
  [1, '已审核'],
  [2, '审核失败'],
]);

const WarehouseDashboard = () => {
  const { warehouseID } = useParams();
  const [curUserInfo] = useAtom(userInfo);
  const [warehouseInfo, setWarehouseInfo] = useState<Partial<Warehouse>>();
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState<boolean>(false);
  const [managers, setManagers] = useState<string[]>();
  const [pendingOutbounds, setPendingOutbounds] = useState<StoreOut[]>([]);
  const [outboundLoading, setOutboundLoading] = useState(false);
  const [statistics, setStatistics] = useState({
    totalOutbound: 0,
    yesterdayOutbound: 0,
    totalInbound: 0,
    yesterdayInbound: 0,
  });
  const [inventory, setInventory] = useState<any[]>([]);

  // 添加查看明细状态
  const [detailVisible, setDetailVisible] = useState(false);
  const [detailData, setDetailData] = useState<any[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);

  // 添加审核状态
  const [auditLoading, setAuditLoading] = useState<Record<string, boolean>>({});

  // 查看明细函数
  const showOutboundDetail = async (djbh: string) => {
    setDetailLoading(true);
    try {
      const res = await queryPageOutDetail(djbh);
      console.log('res=>', res);
      setDetailData(res || []);
      setDetailVisible(true);
    } catch (error) {
      console.error('Failed to fetch outbound detail:', error);
      message.error('获取明细失败');
    } finally {
      setDetailLoading(false);
    }
  };

  // 审核函数
  const handleAudit = async (djbh: string, status: number) => {
    setAuditLoading((prev) => ({ ...prev, [djbh]: true }));
    try {
      // 调用审核API（这里需要根据实际API调整）
      // await auditOutbound(djbh, status);

      // 模拟API调用成功
      await new Promise((resolve) => setTimeout(resolve, 500));

      // 更新待审核列表
      setPendingOutbounds((prev) => prev.filter((item) => item.djbh !== djbh));
      message.success(status === 1 ? '审核通过' : '审核不通过');
    } catch (error) {
      console.error('审核操作失败:', error);
      message.error('审核操作失败');
    } finally {
      setAuditLoading((prev) => ({ ...prev, [djbh]: false }));
    }
  };

  // 获取二维码内容
  const getQRCodeContent = () => {
    // 这里根据你的业务逻辑生成二维码内容
    if (!warehouseInfo?.warehouseCode) return null;
    return `warehouse:${warehouseInfo.warehouseCode}`;
  };

  // 获取待审核出库单
  const fetchPendingOutbounds = async () => {
    if (!warehouseID) return;

    setOutboundLoading(true);
    try {
      const res = await queryPageOutbound({
        warehouseIds: [Number(warehouseID)],
        status: 0, // 待审核
        pageNum: 1,
        pageSize: 100000,
      });
      setPendingOutbounds(res.records || []);
    } catch (error) {
      console.error('Failed to fetch pending outbounds:', error);
    } finally {
      setOutboundLoading(false);
    }
  };

  // 修改后的统计数据获取函数
  const fetchStatistics = async () => {
    if (!warehouseID) return;

    try {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      // 格式化时间
      const formatDate = (date: Date) => {
        return `${date.getFullYear()}-${(date.getMonth() + 1)
          .toString()
          .padStart(2, '0')}-${date
          .getDate()
          .toString()
          .padStart(2, '0')} 00:00:00`;
      };

      const todayStr = formatDate(today);
      const yesterdayStr = formatDate(yesterday);

      // 获取出库总量
      const totalOutboundRes = await queryPageOutbound({
        warehouseIds: [Number(warehouseID)],
        pageNum: 1,
        pageSize: 100000,
      });

      // 获取昨日出库
      const yesterdayOutboundRes = await queryPageOutbound({
        warehouseIds: [Number(warehouseID)],
        pageNum: 1,
        pageSize: 100000,
        start: yesterdayStr,
        end: todayStr,
      });

      // 获取出库总量
      const totalInboundRes = await queryPageInbound({
        warehouseIds: [Number(warehouseID)],
        pageNum: 1,
        pageSize: 100000,
      });

      // 获取昨日出库
      const yesterdayInboundRes = await queryPageInbound({
        warehouseIds: [Number(warehouseID)],
        pageNum: 1,
        pageSize: 100000,
        start: yesterdayStr,
        end: todayStr,
      });

      // 获取入库总量（需要替换为实际入库接口）
      // 这里保持原有模拟数据，实际项目中应替换为入库接口
      setStatistics({
        totalOutbound: totalOutboundRes.total,
        yesterdayOutbound: yesterdayOutboundRes.total,
        totalInbound: totalInboundRes.total,
        yesterdayInbound: yesterdayInboundRes.total,
      });
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
    }
  };

  // 获取库存信息
  const fetchInventory = async () => {
    if (!warehouseID) return;

    try {
      const data = await queryWarehouseInventory(Number(warehouseID));
      setInventory(data);
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
    }
  };

  const fetchManagers = async () => {
    try {
      const res = await getWarehouseManagers();
      setManagers(res);
    } catch (error) {
      console.error('Failed to fetch managers detail:', error);
    }
  };

  const fetchWarehouseDetail = async () => {
    try {
      const res = await queryWareHouse();
      const curwarehouseID = Number(warehouseID);
      const curWarehouseInfo = res.records.find(
        (item) => item.id === curwarehouseID
      );
      setWarehouseInfo(curWarehouseInfo);
    } catch (error) {
      console.error('Failed to fetch warehouse detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchChange = async (
    field: 'isValid' | 'isNeedCheck',
    checked: boolean
  ) => {
    if (!warehouseInfo) return;
    try {
      const updatedInfo = { ...warehouseInfo, [field]: checked ? 1 : 0 };
      await saveWareHouse(updatedInfo);
      setWarehouseInfo(updatedInfo);
      message.success('更新成功');
    } catch (error) {
      message.error('更新失败');
    }
  };

  useEffect(() => {
    if (!warehouseID) return;
    fetchManagers();
    fetchPendingOutbounds();
    fetchStatistics();
    fetchInventory();
  }, [warehouseID]);

  useEffect(() => {
    if (!warehouseID) return;
    fetchWarehouseDetail();
  }, [warehouseID]);

  const handleOpenDoor = () => {
    setWarehouseInfo({ ...warehouseInfo, status: 0 });
    message.success('仓门已开启');
  };

  const handleCloseDoor = () => {
    setWarehouseInfo({ ...warehouseInfo, status: 1 });
    message.success('仓门已关闭');
  };

  if (loading) {
    return (
      <Layout curActive="/home/:warehouseID">
        <div style={{ padding: '24px', textAlign: 'center' }}>
          <Spin size="large" />
        </div>
      </Layout>
    );
  }

  const qrContent = getQRCodeContent();

  return (
    <Layout curActive="/home/:warehouseID">
      {/* 添加明细弹窗 */}
      <Modal
        title="出库明细"
        visible={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={800}
      >
        <Table
          loading={detailLoading}
          dataSource={detailData}
          columns={[
            {
              title: '物料名称',
              dataIndex: 'materialName',
              key: 'materialName',
            },
            { title: '数量', dataIndex: 'sl', key: 'sl' },
            { title: '单位', dataIndex: 'unit', key: 'unit' },
          ]}
          pagination={false}
        />
      </Modal>

      <div style={{ padding: '24px' }}>
        <WarehouseFormModal
          visible={visible}
          onCancel={() => setVisible(false)}
          onSubmit={async (values) => {
            saveWareHouse({ ...values, id: Number(warehouseID) }).then(() => {
              message.success('编辑仓库成功');
              fetchWarehouseDetail();
            });
            setVisible(false);
          }}
          initialValues={warehouseInfo}
        />

        <Row
          gutter={24}
          style={{ height: 'calc(100vh - 112px)' }}
        >
          {/* 第一列：仓库信息 */}
          <Col span={8}>
            <Card
              title="仓库信息"
              style={{ height: '100%', overflow: 'auto' }}
            >
              <Space
                direction="vertical"
                size="middle"
                style={{ width: '100%' }}
              >
                <Title level={4}>{warehouseInfo?.warehouseName}</Title>
                <Text strong>编码：{warehouseInfo?.warehouseCode}</Text>
                <Text strong>地址：{warehouseInfo?.warehouseAddr}</Text>
                <Text strong>所属局：{warehouseInfo?.manageStationName}</Text>
                <Text strong>所属路段：{warehouseInfo?.manageRoadName}</Text>
                <Text strong>简介：{warehouseInfo?.remark}</Text>
                <Text strong>
                  仓库管理员：{managers?.[String(warehouseID)]}
                </Text>
                <Text strong>
                  仓库状态: {warehouseInfo?.status === 0 ? '开启' : '关闭'}
                </Text>
                <Text strong>经度：{warehouseInfo?.longitude}</Text>
                <Text strong>纬度：{warehouseInfo?.latitude}</Text>
                <div>
                  <Text strong>是否可用：</Text>
                  <Switch
                    checked={warehouseInfo?.isValid === 1}
                    onChange={(checked) =>
                      handleSwitchChange('isValid', checked)
                    }
                    style={{ marginLeft: 8 }}
                  />
                </div>
                <div>
                  <Text strong>是否开启免审核：</Text>
                  <Switch
                    checked={warehouseInfo?.isNeedCheck === 1}
                    onChange={(checked) =>
                      handleSwitchChange('isNeedCheck', checked)
                    }
                    style={{ marginLeft: 8 }}
                  />
                </div>
                <Text strong>仓库外摄像头编码：{warehouseInfo?.lCameraId}</Text>
                <Text strong>仓库内摄像头编码：{warehouseInfo?.rCameraId}</Text>

                <Space>
                  <Button onClick={() => setVisible(true)}>编辑信息</Button>
                  <Button
                    type="primary"
                    onClick={handleOpenDoor}
                    disabled={warehouseInfo?.status === 0}
                  >
                    开启仓门
                  </Button>
                  <Button
                    danger
                    onClick={handleCloseDoor}
                    disabled={warehouseInfo?.status === 1}
                  >
                    关闭仓门
                  </Button>
                </Space>
              </Space>
            </Card>
          </Col>

          {/* 第二列：二维码和待审核出库单 */}
          <Col
            span={8}
            style={{ height: '100%' }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
                height: '100%',
              }}
            >
              {/* 二维码区域 */}
              <Card
                title="仓库二维码"
                style={{ flex: '0 0 auto' }}
              >
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  {qrContent ? (
                    <Image
                      src={warehouseInfo?.qrCode}
                      alt="二维码解析错误"
                      style={{ width: 250 }}
                    />
                  ) : (
                    <Empty
                      image={
                        <QrcodeOutlined
                          style={{ fontSize: 48, color: '#d9d9d9' }}
                        />
                      }
                      description="暂无二维码"
                    />
                  )}
                </div>
              </Card>

              {/* 待审核出库单 */}
              <Card
                title="待审核出库单"
                style={{
                  flex: 1,
                  overflow: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                }}
                bodyStyle={{ flex: 1, overflow: 'auto', padding: 0 }}
              >
                <List
                  loading={outboundLoading}
                  dataSource={pendingOutbounds}
                  renderItem={(item) => (
                    <List.Item style={{ padding: '12px 16px' }}>
                      <Card
                        size="small"
                        style={{ width: '100%' }}
                      >
                        <div>
                          <Text strong>{item.materialName}</Text>
                          <div style={{ marginTop: 4 }}>
                            <Text type="secondary">单据编号：{item.djbh}</Text>
                          </div>
                          <div>
                            <Button
                              type="link"
                              onClick={() => showOutboundDetail(item.djbh)}
                              style={{ padding: 0 }}
                            >
                              查看明细
                            </Button>
                          </div>
                          <div>
                            <Text type="secondary">
                              申请人：{item.creatorName}
                            </Text>
                          </div>
                          <div>
                            <Text type="secondary">
                              申请时间：{item.ckTime}
                            </Text>
                          </div>

                          <div
                            style={{
                              marginTop: 12,
                              display: 'flex',
                              justifyContent: 'center',
                              gap: 8,
                            }}
                          >
                            <Button
                              type="primary"
                              size="small"
                              loading={auditLoading[item.djbh]}
                              onClick={() =>
                                checkOutBound({ id: item.id, status: 1 }).then(
                                  () => {
                                    message.success('审核成功');
                                    setTimeout(() => {fetchPendingOutbounds(),fetchInventory()}, 100);
                                  }
                                ).catch((err) => {
                                  message.error(err.data);
                                })
                              }
                            >
                              通过
                            </Button>
                            <Button
                              danger
                              size="small"
                              loading={auditLoading[item.djbh]}
                              onClick={() =>
                                checkOutBound({ id: item.id, status: 2 }).then(
                                  () => {
                                    message.success('审核成功');
                                    setTimeout(() =>{fetchPendingOutbounds(),fetchInventory()}, 100);
                                  }
                                ).catch((err) => {
                                  message.error(err.data);
                                })
                              }
                            >
                              不通过
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </List.Item>
                  )}
                  locale={{ emptyText: '暂无待审核出库单' }}
                />
              </Card>
            </div>
          </Col>

          {/* 第三列：统计数据和库存信息 */}
          <Col
            span={8}
            style={{ height: '100%' }}
          >
            <div
              style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
              }}
            >
              {/* 统计数据 - 2x2布局 */}
              <div style={{ flex: '0 0 auto' }}>
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Card>
                      <Statistic
                        title="出库总量"
                        value={statistics.totalOutbound}
                      />
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card>
                      <Statistic
                        title="昨日出库"
                        value={statistics.yesterdayOutbound}
                      />
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card>
                      <Statistic
                        title="入库总量"
                        value={statistics.totalInbound}
                      />
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card>
                      <Statistic
                        title="昨日入库"
                        value={statistics.yesterdayInbound}
                      />
                    </Card>
                  </Col>
                </Row>
              </div>

              {/* 库存信息 */}
              <Card
                title="库存信息"
                style={{
                  flex: 1,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                }}
                bodyStyle={{ flex: 1, overflow: 'auto' }}
              >
                <Row gutter={[16, 16]}>
                  {inventory.map((item) => (
                    <Col
                      span={12}
                      key={item.id}
                    >
                      <Card size="small">
                        <div>
                          <Text strong>{item.materialName}</Text>
                          <div style={{ marginTop: 8 }}>
                            <Text>当前库存：</Text>
                            <Text
                              style={{
                                color:
                                  item.sl <= item.threshold
                                    ? '#ff4d4f'
                                    : '#52c41a',
                                fontWeight: 'bold',
                              }}
                            >
                              {item.sl}
                            </Text>
                          </div>
                          <div>
                            <Text type="secondary">
                              预警数量：{item.threshold || 0}
                            </Text>
                          </div>
                        </div>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Card>
            </div>
          </Col>
        </Row>
      </div>
    </Layout>
  );
};

export default WarehouseDashboard;
