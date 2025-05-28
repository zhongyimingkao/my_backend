'use client';

import { Button, Card, Col, Form, Input, InputNumber, message, Modal, Popconfirm, Row, Select, Space, Spin, Switch, Table, Typography } from 'antd';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { batchUpdateWareHouseInventory, deleteWareHouse, deleteWareHouseInventory, getWarehouseManagers, queryWareHouse, queryWarehouseInventory, saveWareHouse, saveWareHouseInventory } from '../../storeManage/warehouse/api';
import Layout from '@/components/Layout';
import { Warehouse } from '../../user/type';
import { WarehouseInventory } from '../../storeManage/warehouse/type';
import { TableProps } from 'antd/lib';
import { CloseCircleOutlined, DeleteOutlined, EditOutlined, PlusCircleOutlined, SaveOutlined } from '@ant-design/icons';
import { queryMaterialInfo, QueryMaterialInfoReq } from '../../material/common/api';
import WarehouseFormModal from '../../storeManage/warehouse/WarehouseFormModal';

const { Title, Text } = Typography;

const PAGE_SIZE = 10;

export default function WarehouseDashboard() {
  const { warehouseID } = useParams();
  const [warehouseInfo, setWarehouseInfo] = useState<Partial<Warehouse>>();
  const [warehouseInventory, setWarehouseInventory] = useState<WarehouseInventory[]>();
  const [current, setCurrent] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [editData, setEditData] = useState<WarehouseInventory[]>();
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [visible, setVisible] = useState<boolean>(false);
  const [inventoryVisible, setInventoryVisible] = useState<boolean>(false);
  const [form] = Form.useForm();
  const [materialOptions, setMaterialOptions] = useState<[]>([]);
  const [managers,setManagers] = useState<string[]>();

  const onPageChange = (page: number) => {
    setCurrent(page);
  };

  const fetchManagers = async ()=>{
    try{
      const res = await getWarehouseManagers();
      setManagers(res);
    }catch(error){
      console.error('Failed to fetch managers detail:', error);

    }
  }


  const fetchWarehouseDetail = async () => {
    try {
      const res = await queryWareHouse();
      const curwarehouseID = Number(warehouseID);
      const curWarehouseInfo = res.records.find(item => item.id === curwarehouseID);
      const subRes = await queryWarehouseInventory(curwarehouseID);
      setWarehouseInventory(subRes);
      setWarehouseInfo(curWarehouseInfo);
    } catch (error) {
      console.error('Failed to fetch warehouse detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchChange = async (field: 'isValid' | 'isNeedCheck', checked: boolean) => {
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

  useEffect(() => {
    if (!warehouseID) return;
    queryMaterialInfoData();
    fetchManagers();
  }, [warehouseID]);

  useEffect(() => {
    if (!warehouseID) return;
    fetchWarehouseDetail();
  }, [warehouseID, current])

  const handleOpenDoor = () => {
    // TODO: 调用开启舱门接口
    setWarehouseInfo({ ...warehouseInfo, status: 0 });
    alert('舱门已开启');
  };

  const handleCloseDoor = () => {
    // TODO: 调用关闭舱门接口
    setWarehouseInfo({ ...warehouseInfo, status: 1 });
    alert('舱门已关闭');
  };

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


  const handleEditInventory = (index: number, record: WarehouseInventory) => {
    const curData = ([] as WarehouseInventory[]).concat(editData || []);
    curData[index] = record;
    setEditData(curData);
  };

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
      render: (value, record, index) =>
        isEdit ? (
          <InputNumber
            defaultValue={value}
            onChange={(value) => {
              handleEditInventory(index, { ...record, sl: value });
            }}
          ></InputNumber>
        ) : (
          value
        ),
    },
    {
      title: '物料单位',
      dataIndex: 'unit',
      key: 'unit',
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
    <Layout curActive="/home/:warehouseID">
      <div style={{ padding: '24px' }}>
        <WarehouseFormModal
          visible={visible}
          onCancel={() => {
            setVisible(false);
          }}
          onSubmit={async (values) => {
            saveWareHouse({ ...values, id: Number(warehouseID) }).then(() => {
              message.success('编辑仓库成功');
              fetchWarehouseDetail();
            });
            setVisible(false);
          }}
          initialValues={warehouseInfo}
        />
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
              saveWareHouseInventory({ ...values, warehouseId: Number(warehouseID) }).then(() => {
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
              label="物料方位	"
              name="position"
              rules={[{ required: true, message: '请输入物料方位!' }]}
            >
              <Select
                options={[
                  { label: 'LEFT', value: 'LEFT' },
                  { label: 'RIGHT', value: 'RIGHT' },
                ]}
              />
            </Form.Item>
            <Form.Item<Partial<WarehouseInventory>>
              label="物料库存"
              name="sl"
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
        <Card title="仓库信息">
          <Row>
            <Col span={12}>
              <Space direction="vertical" size="middle">
                <Title level={4}>{warehouseInfo?.warehouseName}</Title>
                <Text strong>编码：{warehouseInfo?.warehouseCode}</Text>
                <Text strong>地址：{warehouseInfo?.warehouseAddr}</Text>
                <Text strong>所属局：{warehouseInfo?.manageStationName}</Text>
                <Text strong>所属路段：{warehouseInfo?.manageRoadName}</Text>
                <Text strong>简介：{warehouseInfo?.remark}</Text>
                <Text strong>仓库管理员：{managers?.[String(warehouseID)]}</Text>
                <Text strong>仓库状态: {warehouseInfo?.status === 0 ? '开启' : '关闭'}</Text>
                <Text strong>经度：{warehouseInfo?.longitude}</Text>
                <Text strong>纬度：{warehouseInfo?.latitude}</Text>
                <Text strong>是否可用：<Switch checked={warehouseInfo?.isValid === 1} onChange={(checked) => handleSwitchChange('isValid', checked)} /></Text>
                <Text strong>是否开启免审核：<Switch checked={warehouseInfo?.isNeedCheck === 1} onChange={(checked) => handleSwitchChange('isNeedCheck', checked)} /></Text>
                <Text strong>仓库外摄像头编码：{warehouseInfo?.lCameraId}</Text>
                <Text strong>仓库内摄像头编码：{warehouseInfo?.rCameraId}</Text>


                <Space>
                  <Button onClick={() => {
                    setVisible(true);
                  }} >
                    编辑信息
                  </Button>
                  <Button type="primary" onClick={handleOpenDoor} disabled={warehouseInfo?.status === 0}>
                    开启舱门
                  </Button>
                  <Button danger onClick={handleCloseDoor} disabled={warehouseInfo?.status === 1}>
                    关闭舱门
                  </Button>
                </Space>
              </Space>
            </Col>
            <Col span={12}>
              <Space direction="vertical" size="middle">
                {
                  warehouseInfo?.qrCode && <>
                    <Text strong>二维码：</Text>
                    <img src={warehouseInfo?.qrCode} alt="qrCode" style={{ width: 250 }} /></>
                }
                <Text strong>库存信息：</Text>
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
                        setIsEdit(false); // 使用回调函数确保基于最新的状态更新
                        setEditData([]);
                      }}
                    >
                      撤销
                      <CloseCircleOutlined style={{ marginLeft: 10 }} />
                    </Button>
                  ) : (
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
    </Layout >
  );
}