'use client';
import Layout from '@/components/Layout';
import { Button, message, Table, TableProps, theme } from 'antd';
import { WxUserInfo } from './type';
import { useState, useEffect } from 'react';
import UserManageSearchForm from './Search';
import { Niconne } from 'next/font/google';
import { queryUserList, updateUser } from './api';
const PAGE_SIZE = 10;

export default function UserManage() {
  const [current, setCurrent] = useState<number>(1);
  const { token } = theme.useToken();
  const [userList, setUserList] = useState<WxUserInfo[]>([]);
  const [total, setTotal] = useState<number>(0);

  const listStyle: React.CSSProperties = {
    borderRadius: token.borderRadiusLG,
    padding: 12,
  };

  const onPageChange = (page: number, pageSize: number) => {
    setCurrent(page);
  };
  const columns: TableProps<WxUserInfo>['columns'] = [
    {
      title: '微信openID',
      dataIndex: 'openid',
      key: 'openid',
    },
    {
      title: '微信昵称',
      dataIndex: 'nickName',
      key: 'nickName',
    },
    {
      title: '用户角色',
      dataIndex: 'role',
      key: 'role',
      render: (_, records) => {
        return records.role === 'admin' ? '管理员' : '用户';
      },
    },
    {
      title: '操作',
      render: (_, record) => {
        return (
          <Button
            type="primary"
            onClick={() => {
              updateUser({
                role: record.role === 'admin' ? 'user' : 'admin',
                id: record.id,
              }).then(() => {
                message.success('角色变更成功');
                setTimeout(() => updateUserList(), 100);
              });
            }}
          >
            {record.role === 'admin' ? '更改为用户' : '更改为管理'}
          </Button>
        );
      },
    },
  ];

  const updateUserList = (nickName?: string) => {
    queryUserList({ pageSize: PAGE_SIZE, pageNum: current, nickName })
      .then((res) => {
        setUserList(res.records);
        setTotal(res.total);
      })
      .catch(() => {
        message.error('小程序用户信息获取失败');
      });
  };

  useEffect(() => {
    updateUserList();
  }, [current]);

  return (
    <Layout
      curActive="/wxUserManage"
      defaultOpen={['/userManage']}
    >
      <UserManageSearchForm
        onSearch={(params) => {
          const { nickName } = params || {};
          updateUserList(nickName);
        }}
      />
      <div style={listStyle}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h3>小程序用户信息列表</h3>
        </div>
        <Table
          pagination={{
            pageSize: PAGE_SIZE,
            current,
            onChange: onPageChange,
            total
          }}
          rowKey="id"
          dataSource={userList}
          columns={columns}
        />
      </div>
    </Layout>
  );
}
