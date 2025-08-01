'use client';

import Layout from '@/components/Layout';
import styles from './index.module.less';

import { useEffect, useState } from 'react';
import {
  Button,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  TableProps,
  message,
  theme,
} from 'antd';
import { MaterialInfo, MaterialType } from '../common/type';
import {
  QueryMaterialInfoReq,
  QueryMaterialTypeReq,
  deleteMaterialInfo,
  queryMaterialInfo,
  queryMaterialType,
  saveMaterialInfo,
} from '../common/api';
import MaterialInfoSearchForm from './Search';
import { useResponsive } from '@/hooks/useResponsive';
import MobileCardList from '@/components/MobileCardList';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

const PAGE_SIZE = 10;

export default function MaterialInfoList() {
  const [data, setData] = useState<MaterialInfo[]>();
  const { token } = theme.useToken();
  const { isMobile } = useResponsive();
  const [current, setCurrent] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const [currentID, setCurrentID] = useState<number>();
  const [visible, setVisible] = useState<boolean>(false);
  const [options, setOptions] = useState();
  const [form] = Form.useForm();

  const listStyle: React.CSSProperties = {
    background: 'white',
    border:'1px solid #ddd',
    borderRadius: token.borderRadiusLG,
    padding: 12,
  };

  const onPageChange = (page: number, pageSize: number) => {
    setCurrent(page);
  };

  const queryMaterialInfoData = (searchParams?: QueryMaterialInfoReq) => {
    queryMaterialInfo({
      pageSize: PAGE_SIZE,
      pageNum: current,
      ...searchParams,
    }).then((res) => {
      setData(res.records);
      setTotal(res.total);
    });
  };

  const queryMaterialTypeData = (searchParams?: QueryMaterialTypeReq) => {
    queryMaterialType({
      pageSize: 10000,
      pageNum: current,
      ...searchParams,
    }).then((res) => {
      setOptions(
        res.records?.map((item: MaterialType) => {
          return { label: item.typeName, value: item.id };
        })
      );
    });
  };
  const columns: TableProps<MaterialInfo>['columns'] = [
    {
      title: '物资编码',
      dataIndex: 'materialCode',
      key: 'materialCode',
    },
    {
      title: '物资名称',
      dataIndex: 'materialName',
      key: 'materialName',
    },
    {
      title: '物资类型',
      dataIndex: 'materialTypeName',
      key: 'materialTypeName',
    },
    {
      title: '描述',
      dataIndex: 'remark',
      key: 'remark',
    },
    {
      title: '单位',
      dataIndex: 'unit',
      key: 'unit',
    },
    {
      title: '特殊说明',
      dataIndex: 'specification',
      key: 'specification',
    },
    {
      title: '操作',
      render: (_, record) => {
        return (
          <Space>
            <Button
              type="link"
              onClick={() => {
                form.setFieldsValue(record);
                setCurrentID(record.id);
                setVisible(true);
              }}
            >
              编辑
            </Button>
            <Popconfirm
              title="删除物资"
              description="确定要删除该物资数据吗?"
              onConfirm={() => {
                deleteMaterialInfo(record.id).then(() => {
                  message.success('删除物资成功');
                  queryMaterialInfoData();
                });
              }}
              okText="确定"
              cancelText="取消"
            >
              <Button
                type="link"
                style={{color:'red'}}
              >
                删除
              </Button>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  useEffect(() => {
    queryMaterialInfoData();
    queryMaterialTypeData();
  }, [current]);

  return (
    <Layout
      curActive="/material/materialInfo"
      defaultOpen={['/material']}
    >
      <main className={styles.warehouseWrap}>
        <div className={styles.content}>
          <Modal
            open={visible}
            title={currentID ? '编辑物资' : '创建物资'}
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
                const newValues = currentID
                  ? { ...values, id: currentID }
                  : { ...values };
                saveMaterialInfo(newValues).then(() => {
                  message.success(`${currentID ? '编辑' : '创建'}物资成功`);
                  setVisible(false);
                  queryMaterialInfoData();
                });
              }}
            >
              <Form.Item<Partial<MaterialInfo>>
                label="物资编码"
                name="materialCode"
                rules={[{ required: true, message: '请输入物资编码!' }]}
              >
                <Input />
              </Form.Item>
              <Form.Item<Partial<MaterialInfo>>
                label="物资名称"
                name="materialName"
                rules={[{ required: true, message: '请输入物资名称!' }]}
              >
                <Input />
              </Form.Item>
              <Form.Item<Partial<MaterialInfo>>
                label="物资类型"
                name="materialType"
                rules={[{ required: true, message: '请选择物资类型!' }]}
              >
                <Select
                  options={options}
                  showSearch
                />
              </Form.Item>
              <Form.Item<Partial<MaterialInfo>>
                label="描述"
                name="remark"
              >
                <Input />
              </Form.Item>
              <Form.Item<Partial<MaterialInfo>>
                label="单位"
                name="unit"
              >
                <Input />
              </Form.Item>
              <Form.Item<Partial<MaterialInfo>>
                label="特殊说明"
                name="specification"
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
          <MaterialInfoSearchForm
            onSearch={(searchParams) => {
              queryMaterialInfoData(searchParams);
            }}
          />
          <div style={listStyle}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 16,
              }}
            >
              <h3>物资信息列表</h3>
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

            {isMobile ? (
              <MobileCardList
                items={data?.map(material => ({
                  id: material.id,
                  title: material.materialName,
                  subtitle: `编码: ${material.materialCode}`,
                  description: material.remark || '暂无描述',
                  tags: [
                    {
                      label: material.materialTypeName,
                      color: 'blue'
                    },
                    {
                      label: `单位: ${material.unit || '未设置'}`,
                      color: 'green'
                    }
                  ],
                  extra: material.specification && (
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      特殊说明: {material.specification}
                    </div>
                  ),
                  actions: [
                    {
                      key: 'edit',
                      label: '编辑',
                      icon: <EditOutlined />,
                      type: 'primary' as const,
                      onClick: () => {
                        form.setFieldsValue(material);
                        setCurrentID(material.id);
                        setVisible(true);
                      }
                    },
                    {
                      key: 'delete',
                      label: '删除',
                      icon: <DeleteOutlined />,
                      danger: true,
                      onClick: () => {
                        Modal.confirm({
                          title: '删除物资',
                          content: '确定要删除该物资数据吗?',
                          onOk: () => {
                            deleteMaterialInfo(material.id).then(() => {
                              message.success('删除物资成功');
                              queryMaterialInfoData();
                            });
                          }
                        });
                      }
                    }
                  ]
                })) || []}
                emptyText="暂无物资数据"
              />
            ) : (
              <Table
                columns={columns}
                dataSource={data}
                pagination={{
                  pageSize: PAGE_SIZE,
                  current,
                  onChange: onPageChange,
                  total,
                }}
                scroll={{ x: 1000 }}
                size="middle"
              />
            )}
          </div>
        </div>
      </main>
    </Layout>
  );
}
