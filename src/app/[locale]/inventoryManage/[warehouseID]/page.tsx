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
} from 'antd';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

import Layout from '@/components/Layout';
import { TableProps } from 'antd/lib';
import {
  CloseCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusCircleOutlined,
  SaveOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import {
  batchUpdateWareHouseInventory,
  deleteWareHouseInventory,
  getWarehouseManagers,
  queryWarehouseInventory,
  saveWareHouseInventory,
} from '../../storeManage/warehouse/api';
import { Warehouse } from '../../user/type';
import { WarehouseInventory } from '../../storeManage/warehouse/type';
import { queryWareHouse } from '../../user/api';
import {
  queryMaterialInfo,
  QueryMaterialInfoReq,
} from '../../material/common/api';

const { Title, Text } = Typography;

const PAGE_SIZE = 10;

export default function InventoryManagement() {
  const { warehouseID } = useParams();
  const [warehouseInfo, setWarehouseInfo] = useState<Partial<Warehouse>>();
  const [warehouseInventory, setWarehouseInventory] =
    useState<WarehouseInventory[]>();
  const [current, setCurrent] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [editData, setEditData] = useState<WarehouseInventory[]>();
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [inventoryVisible, setInventoryVisible] = useState<boolean>(false);
  const [form] = Form.useForm();
  const [materialOptions, setMaterialOptions] = useState<[]>([]);
  const [managers, setManagers] = useState<string>();

  const onPageChange = (page: number) => {
    setCurrent(page);
  };

  const fetchManagers = async () => {
    try {
      const res = await getWarehouseManagers();
      setManagers(res[warehouseID as string].map(item=>item.userName).join(','));
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
      const subRes = await queryWarehouseInventory(curwarehouseID);
      setWarehouseInventory(subRes);
      setWarehouseInfo(curWarehouseInfo);
    } catch (error) {
      console.error('Failed to fetch warehouse detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const queryWarehouseInventoryData = (warehouseId?: number | null) => {
    if (!warehouseId) {
      return;
    }
    queryWarehouseInventory(warehouseId)
      .then((res) => {
        setWarehouseInventory(res);
      })
      .catch(() => {
        message.error('库存查询失败');
      });
  };

  // 导出Excel功能
  const handleExport = async () => {
    try {
      if (!warehouseInventory || warehouseInventory.length === 0) {
        message.warning('暂无库存数据可导出');
        return;
      }

      // 准备导出数据
      const exportData = warehouseInventory.map((item, index) => ({
        序号: index + 1,
        物料名称: item.materialName,
        物料库存: item.sl,
        物料单位: item.unit,
        预警值: item.threshold || 0,
      }));

      // 在表格顶部添加仓库信息
      const headerInfo = [
        [`仓库名称: ${warehouseInfo?.warehouseName || ''}`],
        [`仓库管理员: ${managers || ''}`],
        [''], // 空行
      ];

      // 创建空工作表
      const worksheet = XLSX.utils.aoa_to_sheet([]);

      // 先添加头部信息
      XLSX.utils.sheet_add_aoa(worksheet, headerInfo, { origin: 'A1' });
      
      // 再添加数据（从第4行开始）
      XLSX.utils.sheet_add_json(worksheet, exportData, { 
        origin: 'A4',
        skipHeader: false 
      });

      // 设置列宽
      const colWidths = [
        { wch: 8 },  // 序号
        { wch: 20 }, // 物料名称
        { wch: 12 }, // 物料库存
        { wch: 12 }, // 物料单位
        { wch: 12 }, // 预警值
      ];
      worksheet['!cols'] = colWidths;

      // 创建工作簿
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, '库存管理');

      // 生成Excel文件
      const excelBuffer = XLSX.write(workbook, {
        bookType: 'xlsx',
        type: 'array',
      });

      // 下载文件
      const data = new Blob([excelBuffer], {
        type: 'application/octet-stream',
      });
      
      const fileName = `${warehouseInfo?.warehouseName || '库存管理'}_${new Date().toISOString().slice(0, 10)}.xlsx`;
      saveAs(data, fileName);

      message.success('导出成功');
    } catch (error) {
      message.error('导出失败');
      console.error('导出异常:', error);
    }
  };

  useEffect(() => {
    if (!warehouseID) return;
    queryMaterialInfoData();
    fetchManagers();
  }, [warehouseID]);

  useEffect(() => {
    if (!warehouseID) return;
    fetchWarehouseDetail();
  }, [warehouseID, current]);

  const handleSaveInventory = () => {
    if (editData && editData.length > 0) {
      batchUpdateWareHouseInventory(editData)
        .then(() => {
          message.success('库存修改成功');
          setEditData([]);
          setIsEdit(false);
          queryWarehouseInventoryData(Number(warehouseID));
        })
        .catch(() => {
          message.error('库存修改失败');
        });
    }
  };

  const queryMaterialInfoData = (searchParams?: QueryMaterialInfoReq) => {
    queryMaterialInfo({
      pageSize: PAGE_SIZE,
      pageNum: current,
      ...searchParams,
    }).then((res) => {
      setMaterialOptions(
        res.records.map((item) => ({
          label: item.materialName,
          value: item.id,
        }))
      );
    });
  };

  const handleEditInventory = (record: WarehouseInventory) => {
    setEditData((prev) => {
      const newData = [...(prev || warehouseInventory || [])];
      const index = newData.findIndex((item) => item.id === record.id);
      if (index > -1) {
        newData[index] = record;
      } else {
        newData.push(record);
      }
      return newData;
    });
  };

  const inventoryColumns: TableProps<WarehouseInventory>['columns'] = [
    {
      title: '物料名称',
      dataIndex: 'materialName',
      key: 'materialName',
    },
    {
      title: '物料库存',
      dataIndex: 'sl',
      key: 'sl',
    },
    {
      title: '物料单位',
      dataIndex: 'unit',
      key: 'unit',
    },
    {
      title: '预警值',
      dataIndex: 'threshold',
      key: 'threshold',
      render: (value, record) =>
        isEdit ? (
          <InputNumber
            value={
              editData?.find((item) => item.id === record.id)?.threshold ??
              record.threshold ??
              0
            }
            onChange={(val) => {
              if (val) {
                handleEditInventory({ ...record, threshold: val });
              }
            }}
          />
        ) : (
          value || 0
        ),
    },
    {
      title: '操作',
      hidden: isEdit,
      render: (value, record, index) => (
        <Popconfirm
          title="删除库存"
          description="确认要删除该库存吗?"
          onConfirm={() => {
            deleteWareHouseInventory(record.id)
              .then(() => {
                message.success('库存删除成功');
              })
              .catch(() => {
                message.error('库存删除失败');
              })
              .finally(() => {
                queryWarehouseInventoryData(Number(warehouseID));
              });
          }}
          okText="确认"
          cancelText="取消"
        >
          <DeleteOutlined />
        </Popconfirm>
      ),
    },
  ];

  return (
    <Layout curActive="/inventoryManage/:warehouseID">
      <div>
        <Modal
          open={inventoryVisible}
          title="新增仓库库存"
          onCancel={() => {
            setInventoryVisible(false);
          }}
          footer={null}
        >
          <Form
            name="basic"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 16 }}
            style={{ maxWidth: 600 }}
            form={form}
            autoComplete="off"
            onFinish={(values) => {
              saveWareHouseInventory({
                ...values,
                warehouseId: Number(warehouseID),
                threshold: values.threshold || 0, // 添加默认值
              }).then(() => {
                message.success('创建仓库库存成功');
                queryWarehouseInventoryData(Number(warehouseID));
              });

              setInventoryVisible(false);
            }}
          >
            <Form.Item<Partial<WarehouseInventory>>
              label="物料"
              name="materialId"
              rules={[{ required: true, message: '请输入物料!' }]}
            >
              <Select options={materialOptions} />
            </Form.Item>
            <Form.Item<Partial<WarehouseInventory>>
              label="物料库存"
              name="sl"
            >
              <InputNumber />
            </Form.Item>
            <Form.Item<Partial<WarehouseInventory>>
              label="预警值"
              name="threshold"
              initialValue={0}
            >
              <InputNumber />
            </Form.Item>
            <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
              <Space>
                <Button
                  type="primary"
                  htmlType="submit"
                >
                  提交
                </Button>
                <Button htmlType="reset">重置</Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
        <Card title="库存管理">
          <Row>
            <Col span={24}>
              <Space
                direction="vertical"
                size="middle"
                style={{ width: '100%' }}
              >
                <Title level={4}>
                  {warehouseInfo?.warehouseName} - 库存管理
                </Title>
                <Text strong>
                  仓库管理员：{managers}
                </Text>
                <Space>
                  <Button
                    style={{ fontSize: 14, fontWeight: 600 }}
                    onClick={() => {
                      if (!isEdit) {
                        setIsEdit(true);
                      } else {
                        handleSaveInventory();
                      }
                    }}
                  >
                    {isEdit ? (
                      <>
                        保存库存信息
                        <SaveOutlined style={{ marginLeft: 10 }} />
                      </>
                    ) : (
                      <>
                        编辑库存信息
                        <EditOutlined style={{ marginLeft: 10 }} />
                      </>
                    )}
                  </Button>
                  {isEdit ? (
                    <Button
                      style={{ fontSize: 14, fontWeight: 600, marginLeft: 10 }}
                      onClick={() => {
                        setIsEdit(false);
                        setEditData([]);
                      }}
                    >
                      撤销
                      <CloseCircleOutlined style={{ marginLeft: 10 }} />
                    </Button>
                  ) : (
                    <>
                      <Button
                        style={{ fontSize: 14, fontWeight: 600, marginLeft: 10 }}
                        type="primary"
                        onClick={() => {
                          setInventoryVisible(true);
                        }}
                      >
                        新增库存
                        <PlusCircleOutlined style={{ marginLeft: 5 }} />
                      </Button>
                      <Button
                        style={{ fontSize: 14, fontWeight: 600, marginLeft: 10 }}
                        onClick={handleExport}
                      >
                        导出Excel
                        <DownloadOutlined style={{ marginLeft: 5 }} />
                      </Button>
                    </>
                  )}
                </Space>
                <Table
                  columns={inventoryColumns}
                  dataSource={warehouseInventory}
                  pagination={{
                    pageSize: PAGE_SIZE,
                    current,
                    onChange: onPageChange,
                  }}
                  scroll={{ x: 'max-content' }}
                  style={{ width: '100%' }}
                />
              </Space>
            </Col>
          </Row>
        </Card>
      </div>
    </Layout>
  );
}