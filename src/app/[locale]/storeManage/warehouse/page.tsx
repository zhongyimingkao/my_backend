'use client';
import { useTranslations } from 'next-intl';
import {
  Button,
  Form,
  Input,
  Modal,
  Popconfirm,
  Space,
  Switch,
  Table,
  TableProps,
  message,
  theme,
} from 'antd';
import AvaForm from './AvaForm';
import Layout from '@/components/Layout';
import styles from './index.module.less';
import { useEffect, useMemo, useState } from 'react';
import { Warehouse, WarehouseInventory } from './type';
import {
  closeWareHouse,
  deleteWareHouse,
  openWareHouse,
  queryWareHouse,
  queryWarehouseInventory,
  saveWareHouse,
} from './api';
import { LeftOutlined } from '@ant-design/icons';
import QrCodeDisplay from './QrCodeDisply';

const PAGE_SIZE = 10;

export default function WareHouse() {
  const t = useTranslations('warehouse');
  const { token } = theme.useToken();
  const [data, setData] = useState<Warehouse[]>([]);
  const [current, setCurrent] = useState<number>(1);
  const [warehouseId, setWarehouseId] = useState<number | null>(null);
  const [inventoryData, setInventoryData] = useState<WarehouseInventory[]>();
  const [visible, setVisible] = useState<boolean>(false);
  const [form] = Form.useForm();
  const [currentID, setCurrentID] = useState<number>();
  const [qrCode, setQrCode] = useState<string>('');
  const [qrCodeVisible, setQrcodeVisible] = useState<boolean>(false);

  const updateWareHouse = (value: Warehouse) => {
    saveWareHouse(value).then(() => {
      message.success('仓库数据更新成功');
      queryWareHouseData();
    });
  };

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
      title: '左摄像头编码',
      dataIndex: 'lCameraId',
      key: 'lCameraId',
    },
    {
      title: '右摄像头编码',
      dataIndex: 'rCameraId',
      key: 'rCameraId',
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
      title: '是否禁用',
      dataIndex: 'isValid',
      key: 'isValid',
      render: (value, record) => (
        <Switch
          value={value}
          onChange={(checked) => {
            updateWareHouse({ ...record, isValid: Number(checked) });
          }}
          title={value === 0 ? '禁用' : '可用'}
        ></Switch>
      ),
    },
    {
      title: '是否自动审核',
      dataIndex: 'isNeedCheck',
      key: 'isNeedCheck',
      render: (value, record) => (
        <Switch
          value={value}
          onChange={(checked) => {
            updateWareHouse({ ...record, isNeedCheck: Number(checked) });
          }}
          title={value === 0 ? '关闭' : '开启'}
        ></Switch>
      ),
    },
    {
      title: '仓库二维码',
      dataIndex: 'qrCode',
      key: 'qrCode',
      render: (value) => (
        <Button
          onClick={() => {
            setQrCode(value);
            setQrcodeVisible(true);
          }}
        >
          查看仓库二维码
        </Button>
      ),
    },
    {
      title: '描述',
      dataIndex: 'remark',
      key: 'remark',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <a
            onClick={() => {
              form.setFieldsValue(record);
              setCurrentID(record.id);
              setVisible(true);
            }}
          >
            编辑信息
          </a>
          <a
            onClick={() => {
              setWarehouseId(record.id);
            }}
          >
            查询库存
          </a>
          <a
            onClick={() => {
              openWareHouse(record.id).then(() => {
                message.success('仓库打开成功');
                queryWareHouseData();
              });
            }}
          >
            开启仓库
          </a>
          <a
            onClick={() => {
              closeWareHouse(record.id).then(() => {
                message.success('仓库关闭成功');
                queryWareHouseData();
              });
            }}
          >
            关闭仓库
          </a>
          <Popconfirm
            title="删除仓库"
            description="确定要删除该仓库吗?"
            onConfirm={() => {
              deleteWareHouse(record.id).then(() => {
                message.success('仓库删除成功');
                queryWareHouseData();
              });
            }}
            okText="确定"
            cancelText="取消"
          >
            <a style={{ color: 'red' }}>删除仓库</a>
          </Popconfirm>
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
    {
      title: '物料单位',
      dataIndex: 'unit',
      key: 'unit',
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
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <h3>仓库主信息列表</h3>
              <Button
                type="primary"
                onClick={() => {
                  setVisible(true);
                  form.resetFields();
                  setCurrentID(void 0);
                }}
              >
                新建
              </Button>
            </div>
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
            style={{ marginBottom: 10 }}
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
    <Layout
      curActive="/storeManage/warehouse"
      defaultOpen={['/storeManage']}
    >
      <main className={styles.warehouseWrap}>
        <QrCodeDisplay
          qrCodeUrl={qrCode}
          visible={qrCodeVisible}
          setVisible={setQrcodeVisible}
        />
        <div className={styles.content}>
          <Modal
            open={visible}
            title={currentID ? '编辑仓库' : '创建仓库'}
            onCancel={() => {
              setVisible(false);
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
                if (currentID) {
                  saveWareHouse({ ...values, id: currentID }).then(() => {
                    message.success('编辑仓库成功');
                    queryWareHouseData();
                  });
                } else {
                  saveWareHouse({ ...values }).then(() => {
                    message.success('创建仓库成功');
                    queryWareHouseData();
                  });
                }
                setVisible(false);
              }}
            >
              <Form.Item<Partial<Warehouse>>
                label="仓库编码"
                name="warehouseCode"
                rules={[{ required: true, message: '请输入仓库编码!' }]}
              >
                <Input />
              </Form.Item>
              <Form.Item<Partial<Warehouse>>
                label="仓库名称"
                name="warehouseName"
                rules={[{ required: true, message: '请输入仓库名称!' }]}
              >
                <Input />
              </Form.Item>
              <Form.Item<Partial<Warehouse>>
                label="仓库地址"
                name="warehouseAddr"
                rules={[{ required: true, message: '请输入仓库地址!' }]}
              >
                <Input />
              </Form.Item>
              <Form.Item<Partial<Warehouse>>
                label="描述"
                name="remark"
              >
                <Input />
              </Form.Item>
              <Form.Item<Partial<Warehouse>>
                label="左摄像头编码"
                name="lCameraId"
              >
                <Input />
              </Form.Item>
              <Form.Item<Partial<Warehouse>>
                label="右摄像头编码"
                name="rCameraId"
              >
                <Input />
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
          {renderContent}
        </div>
      </main>
    </Layout>
  );
}
