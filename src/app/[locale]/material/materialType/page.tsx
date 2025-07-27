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
  Space,
  Table,
  TableProps,
  message,
  theme,
} from 'antd';
import { MaterialType } from '../common/type';
import {
  QueryMaterialTypeReq,
  deleteMaterialType,
  queryMaterialType,
  saveMaterialType,
} from '../common/api';
import MaterialTypeSearchForm from './Search';
import { useResponsive } from '@/hooks/useResponsive';
import MobileCardList from '@/components/MobileCardList';
import { EditOutlined, DeleteOutlined, TagsOutlined } from '@ant-design/icons';

const PAGE_SIZE = 10;

export default function MaterialTypeList() {
  const [data, setData] = useState<MaterialType[]>();
  const { token } = theme.useToken();
  const { isMobile } = useResponsive();
  const [current, setCurrent] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const [currentID, setCurrentID] = useState<number>();
  const [form] = Form.useForm();
  const [visible, setVisible] = useState<boolean>(false);

  const listStyle: React.CSSProperties = {
    background: 'white',
    border:'1px solid #ddd',
    borderRadius: token.borderRadiusLG,
    padding: 12,
  };

  const onPageChange = (page: number, pageSize: number) => {
    setCurrent(page);
  };

  const queryMaterialTypeData = (searchParams?: QueryMaterialTypeReq) => {
    queryMaterialType({
      pageSize: PAGE_SIZE,
      pageNum: current,
      ...searchParams,
    }).then((res) => {
      setData(res.records);
      setTotal(res.total);
    });
  };

  const columns: TableProps<MaterialType>['columns'] = [
    {
      title: '类型名称',
      dataIndex: 'typeName',
      key: 'typeName',
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
              title="删除物资类型"
              description="确定要删除该物资数据吗?"
              onConfirm={() => {
                deleteMaterialType(record.id).then(() => {
                  message.success('删除物资类型成功');
                  queryMaterialTypeData();
                });
              }}
              okText="确定"
              cancelText="取消"
            >
              <Button
                type="link"
                style={{ color: 'red' }}
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
    queryMaterialTypeData();
  }, [current]);

  return (
    <Layout
      curActive="/material/materialType"
      defaultOpen={['/material']}
    >
      <main className={styles.warehouseWrap}>
        <div className={styles.content}>
          <Modal
            open={visible}
            title={currentID ? '编辑物资类型' : '创建物资类型'}
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
                saveMaterialType(newValues).then(() => {
                  message.success(`${currentID ? '编辑' : '创建'}物资类型成功`);
                  setVisible(false);
                  queryMaterialTypeData();
                });
              }}
            >
              <Form.Item<Partial<MaterialType>>
                label="物资类型名称"
                name="typeName"
                rules={[{ required: true, message: '请输入物资类型名称!' }]}
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
          <MaterialTypeSearchForm
            onSearch={(searchParams) => {
              queryMaterialTypeData(searchParams);
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
              <h3>物资分类列表</h3>
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
                items={data?.map(materialType => ({
                  id: materialType.id,
                  title: materialType.typeName,
                  subtitle: `类型ID: ${materialType.id}`,
                  tags: [
                    {
                      label: '物资类型',
                      color: 'blue'
                    }
                  ],
                  actions: [
                    {
                      key: 'edit',
                      label: '编辑',
                      icon: <EditOutlined />,
                      type: 'primary' as const,
                      onClick: () => {
                        form.setFieldsValue(materialType);
                        setCurrentID(materialType.id);
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
                          title: '删除物资类型',
                          content: '确定要删除该物资类型吗?',
                          onOk: () => {
                            deleteMaterialType(materialType.id).then(() => {
                              message.success('删除物资类型成功');
                              queryMaterialTypeData();
                            });
                          }
                        });
                      }
                    }
                  ]
                })) || []}
                emptyText="暂无物资类型数据"
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
