'use client';
import Layout from '@/components/Layout';
import {
  Button,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  TableProps,
  theme,
} from 'antd';
import { UserInfo } from './type';
import { useState, useEffect } from 'react';
import { deleteUserInfo, queryWebUserList, updateUserInfo } from './api';
import { queryRoleList } from '../role/api';
import { RoleInfo } from '../role/type';
const PAGE_SIZE = 10;

export default function UserManage() {
  const [current, setCurrent] = useState<number>(1);
  const { token } = theme.useToken();
  const [userList, setUserList] = useState<UserInfo[]>([]);
  const [currentID, setCurrentID] = useState<number | string>();
  const [roleList, setRoleList] = useState<{ label: string; value: number }[]>(
    []
  );
  const [total, setTotal] = useState<number>(0);
  const [form] = Form.useForm();
  const [visible, setVisible] = useState<boolean>(false);

  const listStyle: React.CSSProperties = {
    borderRadius: token.borderRadiusLG,
    padding: 12,
  };

  const onPageChange = (page: number, pageSize: number) => {
    setCurrent(page);
  };
  const columns: TableProps<UserInfo>['columns'] = [
    {
      title: '用户名',
      dataIndex: 'userName',
      key: 'userName',
    },
    {
      title: '登录名',
      dataIndex: 'loginName',
      key: 'loginName',
    },
    {
      title: '角色名称',
      dataIndex: 'roleName',
      key: 'roleName',
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: '身份证号',
      dataIndex: 'identityNum',
      key: 'identityNum',
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
    },
    {
      title: '创建人',
      dataIndex: 'creatorName',
      key: 'creatorName',
    },
    {
      title: '操作',
      render: (_, record) => {
        return (
          <>
            <Button
              type="link"
              onClick={() => {
                setVisible(true);
                form.setFieldsValue(record);
                setCurrentID(record.id);
              }}
            >
              编辑
            </Button>
            <Popconfirm
              title="删除用户"
              description="确定要删除该用户吗?"
              onConfirm={() => {
                deleteUserInfo(Number(record.id)).then(() => {
                  message.success('删除用户成功');
                  updateUserList();
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
          </>
        );
      },
    },
  ];

  // 查询角色列表
  const fetchRoleList = () => {
    queryRoleList({ pageSize: 10000, pageNo: 1 })
      .then((res) => {
        const roles = res.records.map((role: RoleInfo) => ({
          label: role.roleName,
          value: role.id,
        }));
        setRoleList(roles);
      })
      .catch(() => {
        message.error('获取角色列表失败');
      });
  };

  const updateUserList = () => {
    queryWebUserList({ pageSize: PAGE_SIZE, pageNo: current })
      .then((res) => {
        setUserList(res.records);
        setTotal(res.total);
      })
      .catch(() => {
        message.error('获取管理员用户信息获取失败');
      });
  };

  useEffect(() => {
    updateUserList();
    fetchRoleList();
  }, [current]);

  return (
    <Layout
      curActive="/webUserManage"
      defaultOpen={['/userManage']}
    >
      <div style={listStyle}>
        <Modal
          open={visible}
          title={currentID ? '编辑用户' : '新建用户'}
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
              updateUserInfo(newValues).then(() => {
                message.success(`${currentID ? '编辑' : '创建'}用户成功`);
                setVisible(false);
                updateUserList();
              });
            }}
          >
            <Form.Item<Partial<UserInfo>>
              label="用户名"
              name="userName"
              rules={[{ required: true, message: '请输入用户名称!' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item<Partial<UserInfo>>
              label="登录账号"
              name="loginName"
              rules={[{ required: true, message: '请输入账号!' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item<Partial<UserInfo>>
              label="登录密码"
              name="password"
              rules={[{ required: true, message: '请输入密码!' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item<Partial<UserInfo>>
              label="角色"
              name="role"
              rules={[{ required: true, message: '请选择角色!' }]}
            >
              <Select
                options={roleList}
                showSearch
              />
            </Form.Item>
            <Form.Item<Partial<UserInfo>>
              label="手机号"
              name="phone"
            >
              <Input />
            </Form.Item>
            <Form.Item<Partial<UserInfo>>
              label="身份证号"
              name="identityNum"
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
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h3>管理员用户信息列表</h3>
          <Button
            type="primary"
            onClick={() => {
              setVisible(true);
              form.resetFields();
              setCurrentID(void 0);
            }}
          >
            新建用户
          </Button>
        </div>
        <Table
          pagination={{
            pageSize: PAGE_SIZE,
            current,
            onChange: onPageChange,
            total,
          }}
          rowKey="id"
          dataSource={userList}
          columns={columns}
        />
      </div>
    </Layout>
  );
}
