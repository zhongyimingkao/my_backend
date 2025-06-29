'use client';

import {
  Button,
  Card,
  Checkbox,
  Col,
  DatePicker,
  Form,
  message,
  Row,
  Select,
  Space,
  Typography,
} from 'antd';
import { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { DownloadOutlined } from '@ant-design/icons';
import Layout from '@/components/Layout';
import { formatDate } from '@/utils';
import { getUserAuthorizedWarehouses, getUserRole } from '@/utils/permission';

// 导入相关API
import { queryDoorInfo } from '../door/[warehouseID]/api';
import { queryPageInbound, queryPageOutbound } from '../storeManage/common/api';
import { queryWarehouseInventory, getWarehouseManagers } from '../storeManage/warehouse/api';
import { queryWareHouse } from '../user/api';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

// 报表类型定义
interface ReportType {
  key: string;
  label: string;
  description: string;
}

const reportTypes: ReportType[] = [
  {
    key: 'door',
    label: '开关门记录',
    description: '导出仓库开关门操作记录',
  },
  {
    key: 'inbound',
    label: '入库记录',
    description: '导出物资入库记录',
  },
  {
    key: 'outbound',
    label: '出库记录',
    description: '导出物资出库记录',
  },
  {
    key: 'inventory',
    label: '仓库库存记录',
    description: '导出所有仓库的库存信息',
  },
];

const statusMap = new Map<number, string>([
  [0, '待审核'],
  [1, '已审核'],
  [2, '审核失败'],
]);

export default function ReportExport() {
  const [form] = Form.useForm();
  const [selectedReports, setSelectedReports] = useState<string[]>([]);
  const [warehouseOptions, setWarehouseOptions] = useState<any[]>([]);
  const [selectedWarehouses, setSelectedWarehouses] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [allWarehouses, setAllWarehouses] = useState<any[]>([]);
  const [userRole, setUserRole] = useState<{role: number, isAdmin: boolean}>({
    role: 0,
    isAdmin: false
  });

  // 获取仓库列表 - 根据用户权限过滤
  const fetchWarehouses = async () => {
    try {
      // 获取用户角色信息
      const roleInfo = await getUserRole();
      setUserRole(roleInfo);

      let warehouses: any[] = [];
      
      if (roleInfo.isAdmin) {
        // 超级管理员可以看到所有仓库
        const warehouseRes = await queryWareHouse();
        warehouses = warehouseRes.records || [];
      } else {
        // 普通管理员只能看到有权限的仓库
        warehouses = await getUserAuthorizedWarehouses();
      }
      
      setAllWarehouses(warehouses);
      
      const options = warehouses.map((item: any) => ({
        label: item.warehouseName,
        value: item.id,
      }));
      setWarehouseOptions(options);

      if (options.length === 0) {
        message.warning('您暂无任何仓库权限，请联系管理员');
      }
    } catch (error) {
      console.error('获取仓库列表失败:', error);
      message.error('获取仓库列表失败');
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, []);

  // 获取开关门记录数据
  const getDoorData = async (warehouseIds: number[], timeRange?: any) => {
    const params: any = {
      pageSize: 10000,
      pageNum: 1,
      warehouseIds,
    };

    if (timeRange && timeRange.length === 2) {
      params.start = formatDate(new Date(timeRange[0]));
      params.end = formatDate(new Date(timeRange[1]));
    }

    const res = await queryDoorInfo(params);
    return res.records.map((item: any) => ({
      仓库名称: item.warehouseName,
      仓库编码: item.warehouseCode,
      类型: item.type === 'open' ? '开门' : '关门',
      操作时间: item.time,
      操作人: item.openUser,
    }));
  };

  // 获取入库记录数据
  const getInboundData = async (warehouseIds: number[], timeRange?: any) => {
    const params: any = {
      pageSize: 10000,
      pageNum: 1,
      warehouseIds,
    };

    if (timeRange && timeRange.length === 2) {
      params.start = formatDate(new Date(timeRange[0]));
      params.end = formatDate(new Date(timeRange[1]));
    }

    const res = await queryPageInbound(params);
    return res.records.map((item: any) => ({
      仓库名称: item.warehouseName,
      所属局: item.manageStationName,
      所属路段: item.manageRoadName,
      单据编号: item.djbh,
      入库人: item.creatorName || item.wxCreatorName,
      入库时间: item.rkTime,
    }));
  };

  // 获取出库记录数据
  const getOutboundData = async (warehouseIds: number[], timeRange?: any) => {
    const params: any = {
      pageSize: 10000,
      pageNum: 1,
      warehouseIds,
    };

    if (timeRange && timeRange.length === 2) {
      params.start = formatDate(new Date(timeRange[0]));
      params.end = formatDate(new Date(timeRange[1]));
    }

    const res = await queryPageOutbound(params);
    return res.records.map((item: any) => ({
      仓库名称: item.warehouseName,
      所属局: item.manageStationName,
      所属路段: item.manageRoadName,
      单据编号: item.djbh,
      出库状态: statusMap.get(item.status),
      出库人: item.creatorName || item.wxCreatorName,
      出库时间: item.ckTime,
    }));
  };

  // 获取库存记录数据
  const getInventoryData = async (warehouseIds: number[]) => {
    const inventoryData: any[] = [];
    
    // 获取仓库管理员信息
    const managersRes = await getWarehouseManagers();
    
    for (const warehouseId of warehouseIds) {
      try {
        const warehouse = allWarehouses.find(w => w.id === warehouseId);
        const warehouseName = warehouse?.warehouseName || `仓库${warehouseId}`;
        
        // 获取该仓库的管理员
        const managers = managersRes[warehouseId]?.map((item: any) => item.userName).join(',') || '';
        
        // 获取库存数据
        const inventoryRes = await queryWarehouseInventory(warehouseId);
        
        inventoryRes.forEach((item: any, index: number) => {
          inventoryData.push({
            序号: inventoryData.length + 1,
            仓库名称: warehouseName,
            仓库管理员: managers,
            物资名称: item.materialName,
            物资库存: item.sl,
            物资单位: item.unit,
            预警值: item.threshold || 0,
          });
        });
      } catch (error) {
        console.error(`获取仓库${warehouseId}库存失败:`, error);
      }
    }
    
    return inventoryData;
  };

  // 导出Excel
  const handleExport = async () => {
    try {
      const values = await form.validateFields();
      const { timeRange, warehouses } = values;

      if (selectedReports.length === 0) {
        message.warning('请选择要导出的报表类型');
        return;
      }

      if (!warehouses || warehouses.length === 0) {
        message.warning('请选择要导出的仓库');
        return;
      }

      setLoading(true);

      // 创建工作簿
      const workbook = XLSX.utils.book_new();

      // 根据选择的报表类型导出数据
      for (const reportType of selectedReports) {
        let data: any[] = [];
        let sheetName = '';

        switch (reportType) {
          case 'door':
            data = await getDoorData(warehouses, timeRange);
            sheetName = '开关门记录';
            break;
          case 'inbound':
            data = await getInboundData(warehouses, timeRange);
            sheetName = '入库记录';
            break;
          case 'outbound':
            data = await getOutboundData(warehouses, timeRange);
            sheetName = '出库记录';
            break;
          case 'inventory':
            data = await getInventoryData(warehouses);
            sheetName = '仓库库存记录';
            break;
        }

        if (data.length > 0) {
          const worksheet = XLSX.utils.json_to_sheet(data);
          
          // 设置列宽
          const colWidths = Object.keys(data[0]).map(() => ({ wch: 15 }));
          worksheet['!cols'] = colWidths;
          
          XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
        }
      }

      // 生成Excel文件
      const excelBuffer = XLSX.write(workbook, {
        bookType: 'xlsx',
        type: 'array',
      });

      // 下载文件
      const data = new Blob([excelBuffer], {
        type: 'application/octet-stream',
      });
      
      const fileName = `报表导出_${new Date().toISOString().slice(0, 10)}.xlsx`;
      saveAs(data, fileName);

      message.success('导出成功');
    } catch (error) {
      message.error('导出失败');
      console.error('导出异常:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout curActive="/reportExport">
      <Card title="报表导出">
        <Form
          form={form}
          layout="vertical"
          style={{ maxWidth: 800 }}
        >
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Title level={4}>选择导出内容</Title>
              <Checkbox.Group
                value={selectedReports}
                onChange={setSelectedReports}
                style={{ width: '100%' }}
              >
                <Row gutter={[16, 16]}>
                  {reportTypes.map((report) => (
                    <Col span={12} key={report.key}>
                      <Card
                        size="small"
                        style={{
                          border: selectedReports.includes(report.key)
                            ? '2px solid #1890ff'
                            : '1px solid #d9d9d9',
                        }}
                      >
                        <Checkbox value={report.key}>
                          <div>
                            <div style={{ fontWeight: 'bold' }}>
                              {report.label}
                            </div>
                            <div style={{ fontSize: '12px', color: '#666' }}>
                              {report.description}
                            </div>
                          </div>
                        </Checkbox>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Checkbox.Group>
            </Col>

            <Col span={24}>
              <Form.Item
                label={`选择仓库 ${!userRole.isAdmin ? '(仅显示您有权限的仓库)' : ''}`}
                name="warehouses"
                rules={[{ required: true, message: '请选择仓库' }]}
              >
                <Select
                  mode="multiple"
                  placeholder={warehouseOptions.length === 0 ? '暂无可选仓库' : '请选择要导出的仓库'}
                  options={warehouseOptions}
                  style={{ width: '100%' }}
                  disabled={warehouseOptions.length === 0}
                />
              </Form.Item>
              {!userRole.isAdmin && (
                <Text type="secondary">
                  提示：普通管理员只能导出有权限的仓库数据
                </Text>
              )}
            </Col>

            <Col span={24}>
              <Form.Item
                label="时间范围（可选）"
                name="timeRange"
              >
                <RangePicker
                  style={{ width: '100%' }}
                  placeholder={['开始时间', '结束时间']}
                />
              </Form.Item>
              <Text type="secondary">
                注意：时间范围仅对开关门记录、入库记录、出库记录有效，库存记录导出当前最新数据
              </Text>
            </Col>

            <Col span={24}>
              <Space>
                <Button
                  type="primary"
                  onClick={handleExport}
                  loading={loading}
                  disabled={selectedReports.length === 0 || warehouseOptions.length === 0}
                >
                  导出Excel
                  <DownloadOutlined style={{ marginLeft: 5 }} />
                </Button>
                <Button
                  onClick={() => {
                    form.resetFields();
                    setSelectedReports([]);
                  }}
                >
                  重置
                </Button>
              </Space>
            </Col>
          </Row>
        </Form>
      </Card>
    </Layout>
  );
}