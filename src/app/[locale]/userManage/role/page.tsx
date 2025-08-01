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
  Table,
  TableProps,
  theme,
  TreeSelect,
} from 'antd';
import { useState, useEffect } from 'react';
import {
  deleteRoleInfo,
  getWarehouseMenus,
  queryRoleList,
  saveRole,
} from './api';
import { RoleInfo } from './type';
import { Station } from '../../user/type';
import { useResponsive } from '@/hooks/useResponsive';
import MobileCardList from '@/components/MobileCardList';
import { EditOutlined, DeleteOutlined, SettingOutlined } from '@ant-design/icons';

const PAGE_SIZE = 10;

export default function RoleManage() {
  const [current, setCurrent] = useState<number>(1);
  const { token } = theme.useToken();
  const { isMobile } = useResponsive();
  const [roleList, setRoleList] = useState<RoleInfo[]>([]);
  const [currentID, setCurrentID] = useState<number | string>();
  const [form] = Form.useForm();
  const [visible, setVisible] = useState<boolean>(false);
  const [warehouseTree, setWarehouseTree] = useState<any[]>([]);
  // 新增状态管理弹窗
  const [permissionVisible, setPermissionVisible] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleInfo | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [total, setTotal] = useState<number>(0);

  const listStyle: React.CSSProperties = {
    background: 'white',
    border:'1px solid #ddd',
    borderRadius: token.borderRadiusLG,
    padding: 12,
  };

  const onPageChange = (page: number) => {
    setCurrent(page);
  };

  // 检查是否可以删除系统管理员
  const canDeleteAdmin = (roleId: number) => {
    // 如果不是系统管理员角色，可以删除
    if (roleId !== 2) return true;
    
    // 统计系统管理员的数量
    const adminCount = roleList.filter(role => role.id === 2).length;
    return adminCount > 1; // 只有当系统管理员数量大于1时才能删除
  };

  const columns: TableProps<RoleInfo>['columns'] = [
    {
      title: '角色名称',
      dataIndex: 'roleName',
      key: 'roleName',
    },
    {
      title: '描述',
      dataIndex: 'roleDescription',
      key: 'roleDescription',
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
    },
    // 修改权限列渲染逻辑
    {
      title: '权限',
      dataIndex: 'permissions',
      key: 'permissions',
      render: (permissions: string[], record: RoleInfo) => (
        <>
          <Button
            type="link"
            disabled={record.id === 2} // 系统管理员不允许编辑权限
            onClick={() => {
              setEditingRole(record);
              setSelectedPermissions(permissions);
              setPermissionVisible(true);
            }}
          >
            {record.id === 2 ? '系统管理员' : `查看/编辑权限（${permissions.length}个）`}
          </Button>
        </>
      ),
    },
    {
      title: '操作',
      render: (_, record) => {
        const isSystemAdmin = record.id === 2;
        const canDelete = canDeleteAdmin(record.id);
        
        return (
          <>
            <Button
              type="link"
              disabled={isSystemAdmin} // 系统管理员不允许编辑
              onClick={() => {
                setVisible(true);
                setCurrentID(record.id);
                form.setFieldsValue(record);
              }}
            >
              编辑
            </Button>
            <Popconfirm
              title="删除角色"
              description={
                isSystemAdmin && !canDelete 
                  ? "不能删除最后一个系统管理员" 
                  : "确定要删除该角色吗?"
              }
              onConfirm={() => {
                if (!canDelete) {
                  message.error('不能删除最后一个系统管理员');
                  return;
                }
                deleteRoleInfo(record.id).then(() => {
                  message.success('删除角色成功');
                  updateRoleList();
                });
              }}
              okText="确定"
              cancelText="取消"
              disabled={!canDelete}
            >
              <Button
                type="link"
                style={{ color: canDelete ? 'red' : '#ccc' }}
                disabled={!canDelete}
              >
                删除
              </Button>
            </Popconfirm>
          </>
        );
      },
    },
  ];

  const loadTreeData = () => {
    getWarehouseMenus()
      .then((data: Station[]) => {
        const formatTreeData = data.map((station, index) => ({
          title: station.manageStation || '未命名',
          value: `station_${station.manageStationID}`,
          children: station.manageRoad?.map((road, index) => ({
            title: road.roadName || '未命名',
            value: `road_${road.roadID}`,
            children: road.warehouses?.map((warehouse: any) => ({
              title: warehouse.warehouseName || '未命名',
              value: String(warehouse.id),
            })),
          })),
        }));
        setWarehouseTree(formatTreeData);
      })
      .catch(() => {
        message.error('加载仓库列表失败');
      });
  };

  const updateRoleList = () => {
    queryRoleList({ pageSize: PAGE_SIZE, pageNum: current })
      .then((res) => {
        setRoleList(res.records);
        setTotal(res.total);
      })
      .catch(() => {
        message.error('获取角色列表失败');
      });
  };

  useEffect(() => {
    updateRoleList();
    loadTreeData();
  }, [current]);

  return (
    <Layout
      curActive="/userManage/role"
      defaultOpen={['/userManage']}
    >
      <div style={listStyle}>
        <Modal
          open={visible}
          title={currentID ? '编辑角色' : '新建角色'}
          onCancel={() => {
            setVisible(false);
          }}
          footer={null}
        >
          <Form
            name="roleForm"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 16 }}
            style={{ maxWidth: 600 }}
            form={form}
            autoComplete="off"
            onFinish={(values) => {
              const newValues = currentID
                ? { ...values, id: currentID }
                : { ...values };
              saveRole(newValues).then(() => {
                message.success(`${currentID ? '编辑' : '创建'}角色成功`);
                setVisible(false);
                updateRoleList();
              });
            }}
          >
            <Form.Item
              label="角色名称"
              name="roleName"
              rules={[{ required: true, message: '请输入角色名称!' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="角色描述"
              name="roleDescription"
            >
              <Input.TextArea />
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
        <Modal
          title="权限管理"
          open={permissionVisible}
          onCancel={() => setPermissionVisible(false)}
          okText="保存"
          cancelText="取消"
          onOk={() => {
            if (editingRole) {
              saveRole({
                ...editingRole,
                permissions: selectedPermissions,
              }).then(() => {
                message.success('权限更新成功');
                updateRoleList();
                setPermissionVisible(false);
              });
            }
          }}
        >
          <TreeSelect
            treeData={warehouseTree}
            treeCheckable
            showCheckedStrategy={TreeSelect.SHOW_CHILD}
            style={{ width: '100%' }}
            value={selectedPermissions}
            onChange={(value) => setSelectedPermissions(value as string[])}
          />
        </Modal>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
          }}
        >
          <h3>角色管理</h3>
          <Button
            type="primary"
            onClick={() => {
              setVisible(true);
              form.resetFields();
              setCurrentID(void 0);
            }}
          >
            新建角色
          </Button>
        </div>
        {isMobile ? (
          <MobileCardList
            items={roleList.map(role => {
              const isSystemAdmin = role.id === 2;
              const canDelete = canDeleteAdmin(role.id);
              return {
                id: role.id,
                title: role.roleName,
                subtitle: `创建时间: ${role.createTime}`,
                description: role.roleDescription || '暂无描述',
                tags: [
                  {
                    label: isSystemAdmin ? '系统管理员' : '普通角色',
                    color: isSystemAdmin ? 'red' : 'blue'
                  },
                  {
                    label: `权限: ${role.permissions?.length || 0}个`,
                    color: 'green'
                  }
                ],
                actions: [
                  ...(!isSystemAdmin ? [{
                    key: 'edit',
                    label: '编辑',
                    icon: <EditOutlined />,
                    type: 'primary' as const,
                    onClick: () => {
                      setVisible(true);
                      setCurrentID(role.id);
                      form.setFieldsValue(role);
                    }
                  }] : []),
                  ...(!isSystemAdmin ? [{
                    key: 'permission',
                    label: '权限',
                    icon: <SettingOutlined />,
                    onClick: () => {
                      setEditingRole(role);
                      setSelectedPermissions(role.permissions || []);
                      setPermissionVisible(true);
                    }
                  }] : []),
                  ...(canDelete ? [{
                    key: 'delete',
                    label: '删除',
                    icon: <DeleteOutlined />,
                    danger: true,
                    onClick: () => {
                      Modal.confirm({
                        title: '删除角色',
                        content: '确定要删除该角色吗?',
                        onOk: () => {
                          deleteRoleInfo(role.id).then(() => {
                            message.success('删除角色成功');
                            updateRoleList();
                          });
                        }
                      });
                    }
                  }] : [])
                ]
              };
            })}
            emptyText="暂无角色数据"
          />
        ) : (
          <Table
            pagination={{
              pageSize: PAGE_SIZE,
              current,
              onChange: onPageChange,
              total,
            }}
            rowKey="id"
            dataSource={roleList}
            columns={columns}
            size="middle"
          />
        )}
      </div>
    </Layout>
  );
}
