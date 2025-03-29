'use client';
import Layout from '@/components/Layout';
import { Button, Form, Input, message, Modal, Popconfirm, Space, Table } from 'antd';
import { DepartmentInfo, RoadPO } from './type';
import { useEffect, useState } from 'react';
import { 
  addDepartment, 
  deleteDepartmentInfo, 
  queryDepartmentList, 
  saveRoad, 
  updateDepartmentInfo 
} from './api';

export default function DepartmentManage() {
  const [form] = Form.useForm();
  const [roadForm] = Form.useForm();
  const [departmentList, setDepartmentList] = useState<DepartmentInfo[]>([]);
  const [currentId, setCurrentId] = useState<number>();
  const [roadVisible, setRoadVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentDepartmentId, setCurrentDepartmentId] = useState<number>();

  // 获取部门列表
  const fetchDepartmentList = () => {
    queryDepartmentList()
      .then(data => {
        const treeData = data.map(item => ({
          ...item,
          key: `dept_${item.id}`,
          children: item.roadPOList.map(road => ({
            ...road,
            key: `road_${road.id}`,
          }))
        }));
        setDepartmentList(treeData);
      })
      .catch(() => message.error('获取部门列表失败'));
  };

  useEffect(() => {
    fetchDepartmentList();
  }, []);

  // 表格列配置
  const columns = [
    {
      title: '部门/路段名称',
      dataIndex: 'stationName',
      key: 'stationName',
      render: (text: string, record: any) => record.road || text,
    },
    {
      title: '备注',
      dataIndex: 'note',
      key: 'note',
      render: (text: string) => text || '--',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Space>
          {record.road ? (
            <>
              <Button type="link" onClick={() => handleEditRoad(record)}>
                编辑路段
              </Button>
              {/* <Popconfirm
                title="删除路段"
                onConfirm={() => handleDeleteRoad(record.id)}
              >
                <Button type="link" danger>
                  删除
                </Button>
              </Popconfirm> */}
            </>
          ) : (
            <>
              <Button type="link" onClick={() => handleEditDepartment(record)}>
                编辑
              </Button>
              <Button 
                type="link"
                onClick={() => {
                  setCurrentDepartmentId(record.id);
                  setRoadVisible(true);
                }}
              >
                添加路段
              </Button>
              {/* <Popconfirm
                title="删除部门"
                onConfirm={() => handleDeleteDepartment(record.id)}
              >
                <Button type="link" danger>
                  删除
                </Button>
              </Popconfirm> */}
            </>
          )}
        </Space>
      ),
    },
  ];

  // 部门操作处理
  const handleEditDepartment = (record: DepartmentInfo) => {
    form.setFieldsValue(record);
    setCurrentId(record.id);
    setModalVisible(true);
  };

  const handleDeleteDepartment = (id: number) => {
    deleteDepartmentInfo(id)
      .then(() => {
        message.success('删除成功');
        fetchDepartmentList();
      })
      .catch(() => message.error('删除失败'));
  };

  // 路段操作处理
  const handleEditRoad = (record: RoadPO) => {
    roadForm.setFieldsValue(record);
    setRoadVisible(true);
  };

  const handleDeleteRoad = (id: number) => {
    saveRoad({ id, deleted: 1 })
      .then(() => {
        message.success('删除成功');
        fetchDepartmentList();
      })
      .catch(() => message.error('删除失败'));
  };

  // 表单提交
  const handleSubmit = (values: any) => {
    const action = currentId 
      ? updateDepartmentInfo({ ...values, id: currentId })
      : addDepartment(values);

    action.then(() => {
      message.success(`操作成功`);
      setModalVisible(false);
      fetchDepartmentList();
    }).catch(() => message.error('操作失败'));
  };

  const handleRoadSubmit = (values: any) => {
    saveRoad({
      ...values,
      stationId: currentDepartmentId,
      deleted: 0
    }).then(() => {
      message.success('操作成功');
      setRoadVisible(false);
      fetchDepartmentList();
    }).catch(() => message.error('操作失败'));
  };

  return (
    <Layout curActive="/departmentManage" defaultOpen={['/departmentManage']}>
      <div style={{ padding: 24 }}>
        <div style={{ marginBottom: 16, textAlign: 'right' }}>
          <Button 
            type="primary" 
            onClick={() => {
              form.resetFields();
              setCurrentId(undefined);
              setModalVisible(true);
            }}
          >
            新建部门
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={departmentList}
          expandable={{
            defaultExpandAllRows: true,
          }}
        />

        {/* 部门信息弹窗 */}
        <Modal
          title={currentId ? '编辑部门' : '新建部门'}
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={null}
        >
          <Form form={form} onFinish={handleSubmit}>
            <Form.Item
              label="部门名称"
              name="stationName"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
            <Form.Item label="备注" name="note">
              <Input.TextArea />
            </Form.Item>
            <Form.Item wrapperCol={{ offset: 8 }}>
              <Space>
                <Button type="primary" htmlType="submit">提交</Button>
                <Button onClick={() => setModalVisible(false)}>取消</Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        {/* 路段信息弹窗 */}
        <Modal
          title="路段信息"
          open={roadVisible}
          onCancel={() => setRoadVisible(false)}
          footer={null}
        >
          <Form form={roadForm} onFinish={handleRoadSubmit}>
            <Form.Item
              label="路段名称"
              name="road"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
            <Form.Item wrapperCol={{ offset: 8 }}>
              <Space>
                <Button type="primary" htmlType="submit">提交</Button>
                <Button onClick={() => setRoadVisible(false)}>取消</Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </Layout>
  );
}