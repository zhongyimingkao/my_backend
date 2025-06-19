'use client';
import Layout from '@/components/Layout';
import {
  Button,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Space,
  Tree,
  Typography,
  Row,
  Col,
  Menu,
  Dropdown,
  Tooltip,
} from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { DepartmentInfo, RoadPO } from './type';
import { useEffect, useState } from 'react';
import {
  addDepartment,
  queryDepartmentList,
  saveRoad,
  updateDepartmentInfo,
} from './api';
import WarehouseList from './WarehouseList';
import { useRouter } from 'next/navigation';
import { queryWareHouse } from '../storeManage/warehouse/api';

const { Title } = Typography;

export default function DepartmentManage() {
  const [form] = Form.useForm();
  const [roadForm] = Form.useForm();
  const [departmentList, setDepartmentList] = useState<DepartmentInfo[]>([]);
  const [currentId, setCurrentId] = useState<number>();
  const [roadVisible, setRoadVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentDepartmentId, setCurrentDepartmentId] = useState<number>();
  const [currentRoadId, setCurrentRoadId] = useState<number>();
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState<number | null>(
    null
  );
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]); // 添加选中的节点状态
  const router = useRouter();

  // 树节点展开处理
  const handleExpand = (expandedKeys: React.Key[]) => {
    setExpandedKeys(expandedKeys);
  };

  // 获取部门列表
  const fetchDepartmentList = () => {
    queryDepartmentList()
      .then((data) => {
        const treeData = data.map((item) => ({
          ...item,
          key: `dept_${item.id}`,
          title: item.stationName,
          children: item.roadPOList.map((road) => ({
            ...road,
            key: `road_${road.id}`,
            title: road.road,
          })),
        }));
        setDepartmentList(treeData);

        // 设置所有节点为展开状态
        const allKeys = treeData.flatMap((dept) => [
          dept.key,
          ...(dept.children || []).map((child) => child.key),
        ]);
        setExpandedKeys(allKeys);

        // 查找第一个叶子节点（路段节点）
        const firstLeafNode = treeData
          .flatMap((dept) => dept.children || [])
          .find((child) => child);

        if (firstLeafNode) {
          // 设置选中状态
          setSelectedKeys([firstLeafNode.key]);
          // 触发选中处理
          handleSelect([firstLeafNode.key], { node: firstLeafNode });
        }
      })
      .catch(() => message.error('获取部门列表失败'));
  };

  useEffect(() => {
    fetchDepartmentList();
  }, []);

  // 获取仓库数据
  const fetchWarehouses = (
    node: any,
    page: number = 1,
    pageSize: number = 10
  ) => {
    const params: any = {
      page,
      pageSize,
    };

    if (node.key.startsWith('dept_')) {
      // 部门节点
      params.manageStation = node.id;
    } else if (node.key.startsWith('road_')) {
      // 路段节点
      params.manageRoad = node.id;
    }

    queryWareHouse(params)
      .then((data: any) => {
        setWarehouses(data.records || []);
        setPagination({
          ...pagination,
          current: data.current,
          pageSize: data.size,
          total: data.total,
        });
      })
      .catch(() => message.error('获取仓库数据失败'));
  };

  // 树节点选择处理
  const handleSelect = (selectedKeys: React.Key[], info: any) => {
    const node = info.node;
    setSelectedNode(node);
    setSelectedKeys(selectedKeys); // 更新选中状态
    setSelectedWarehouse(null);

    // 调用API获取仓库数据
    fetchWarehouses(node);
  };

  // 分页变化处理
  const handlePageChange = (page: number, pageSize: number) => {
    setPagination({ ...pagination, current: page, pageSize });
    if (selectedNode) {
      fetchWarehouses(selectedNode, page, pageSize);
    }
  };

  // 在状态中添加分页信息
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    onChange: handlePageChange,
  });

  // 仓库点击处理
  const handleWarehouseClick = (id: number) => {
    setSelectedWarehouse(id);
  };

  // 部门操作处理
  const handleEditDepartment = (record: DepartmentInfo) => {
    form.setFieldsValue(record);
    setCurrentId(record.id);
    setModalVisible(true);
  };

  // 路段操作处理
  const handleEditRoad = (record: RoadPO) => {
    roadForm.setFieldsValue(record);
    setCurrentRoadId(record.id);
    setRoadVisible(true);
  };

  // 表单提交
  const handleSubmit = (values: any) => {
    const action = currentId
      ? updateDepartmentInfo({ ...values, id: currentId })
      : addDepartment(values);

    action
      .then(() => {
        message.success(`操作成功`);
        setModalVisible(false);
        fetchDepartmentList();
      })
      .catch(() => message.error('操作失败'));
  };

  const handleRoadSubmit = (values: any) => {
    saveRoad({
      ...values,
      id: currentRoadId,
      stationId: currentDepartmentId,
      deleted: 0,
    })
      .then(() => {
        message.success('操作成功');
        setRoadVisible(false);
        fetchDepartmentList();
      })
      .catch(() => message.error('操作失败'));
  };

  // 自定义树节点标题
  const renderTitle = (node: any) => {
    const isDept = node.key.startsWith('dept_');
    const id = parseInt(node.key.replace(isDept ? 'dept_' : 'road_', ''));

    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
        }}
      >
        <span style={{ flex: 1 }}>{node.title}</span>
        <div
          style={{
            display: 'flex',
            gap: 12,
            zIndex: 0,
            left: isDept ? 183 : 185,
            justifyContent: 'flex-end',
            position: 'absolute',
            color: 'black',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <Tooltip title="编辑">
            <EditOutlined
              onClick={() => {
                if (isDept) {
                  const dept = departmentList.find((d) => d.id === id);
                  if (dept) handleEditDepartment(dept);
                } else {
                  const road = departmentList
                    .flatMap((d) => d.roadPOList)
                    .find((r) => r.id === id);
                  if (road) handleEditRoad(road);
                }
              }}
            />
          </Tooltip>

          {isDept && (
            <Tooltip title="添加路段">
              <PlusOutlined
                onClick={() => {
                  setCurrentDepartmentId(id);
                  setRoadVisible(true);
                }}
              />
            </Tooltip>
          )}

          <Popconfirm
            title="删除部门/路段"
            description="确认要删除该部门/路段吗?"
            onConfirm={() => {
              if (isDept) {
                // 删除部门 - 调用更新接口
                const dept = departmentList.find((d) => d.id === id);
                if (dept) {
                  updateDepartmentInfo({ ...dept, deleted: 1 })
                    .then(() => {
                      message.success('删除成功');
                    })
                    .catch(() => {
                      message.error('删除失败');
                    })
                    .finally(() => {
                      fetchDepartmentList();
                    });
                }
              } else {
                // 删除路段 - 调用保存接口
                const road = departmentList
                  .flatMap((d) => d.roadPOList)
                  .find((r) => r.id === id);
                if (road) {
                  saveRoad({ ...road, deleted: 1 })
                    .then(() => {
                      message.success('删除成功');
                    })
                    .catch(() => {
                      message.error('删除失败');
                    })
                    .finally(() => {
                      fetchDepartmentList();
                    });
                }
              }
            }}
            okText="确认"
            cancelText="取消"
          >
            <Tooltip title="删除">
              <DeleteOutlined />
            </Tooltip>
          </Popconfirm>
        </div>
      </div>
    );
  };

  return (
    <Layout
      curActive="/departmentManage"
      defaultOpen={['/departmentManage']}
    >
      <div
        style={{
          padding: 24,
          display: 'flex',
          height: 'calc(100vh - 112px)',
          minHeight: 600,
        }}
      >
        {/* 左侧树形菜单 */}
        <div
          style={{
            width: 300,
            marginRight: 24,
            borderRight: '1px solid #f0f0f0',
            paddingRight: 24,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              marginBottom: 16,
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <Title
              level={4}
              style={{ margin: 0 }}
            >
              部门结构
            </Title>
            <Button
              type="primary"
              size="small"
              onClick={() => {
                form.resetFields();
                setCurrentId(undefined);
                setModalVisible(true);
              }}
            >
              新建部门
            </Button>
          </div>

          <div style={{ flex: 1, overflow: 'auto', background: '#d6e7f5' }}>
            <Tree
              treeData={departmentList}
              onSelect={handleSelect}
              expandedKeys={expandedKeys}
              onExpand={handleExpand}
              titleRender={renderTitle}
              selectedKeys={selectedKeys} // 设置选中的节点
            />
          </div>
        </div>

        {/* 右侧内容区 */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
          }}
        >
          <div
            style={{
              marginBottom: 24,
              flex: 1,
              minHeight: '50%',
              overflow: 'auto',
            }}
          >
            <Title
              level={4}
              style={{ marginBottom: 16 }}
            >
              {selectedNode
                ? `${selectedNode.title} - 仓库列表`
                : '请选择部门或路段'}
            </Title>

            <WarehouseList
              warehouses={warehouses}
              onWarehouseClick={handleWarehouseClick}
              pagination={pagination}
            />
          </div>
        </div>
      </div>

      {/* 部门信息弹窗 */}
      <Modal
        title={currentId ? '编辑部门' : '新建部门'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          onFinish={handleSubmit}
        >
          <Form.Item
            label="部门名称"
            name="stationName"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="备注"
            name="note"
          >
            <Input.TextArea />
          </Form.Item>
          <Form.Item wrapperCol={{ offset: 8 }}>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
              >
                提交
              </Button>
              <Button onClick={() => setModalVisible(false)}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 路段信息弹窗 */}
      <Modal
        title={currentRoadId ? '编辑路段' : '新建路段'}
        open={roadVisible}
        onCancel={() => setRoadVisible(false)}
        footer={null}
      >
        <Form
          form={roadForm}
          onFinish={handleRoadSubmit}
        >
          <Form.Item
            label="路段名称"
            name="road"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item wrapperCol={{ offset: 8 }}>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
              >
                提交
              </Button>
              <Button onClick={() => setRoadVisible(false)}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
}
