'use client';
import Layout from '@/components/Layout';
import { Button, Table, TableProps, theme } from 'antd';
import { WxUserInfo } from './type';
import { useState } from 'react';
import UserManageSearchForm from './Search';
import { Niconne } from 'next/font/google';
const PAGE_SIZE = 10;

const wxUserInfoMock: WxUserInfo[] = [
  {
    openId: 'o6_bmjrPTlm6_2sgVt7hMZOPfL2M',
    nickName: '张三',
    isAdmin: false,
  },
  {
    openId: 'o6_bmjrPTlm6_2sgVt7hMZOPfL3N',
    nickName: '李四',
    isAdmin: true,
  },
  {
    openId: 'o6_bmjrPTlm6_2sgVt7hMZOPfL4M',
    nickName: '王五',
    isAdmin: false,
  },
];

export default function UserManage() {
  const [current, setCurrent] = useState<number>(1);
  const { token } = theme.useToken();

  const listStyle: React.CSSProperties = {
    background: token.colorFillAlter,
    borderRadius: token.borderRadiusLG,
    padding: 12,
  };

  const onPageChange = (page: number, pageSize: number) => {
    setCurrent(page);
  };
  const columns: TableProps<WxUserInfo>['columns'] = [
    {
      title: '微信openID',
      dataIndex: 'openId',
      key: 'openId',
    },
    {
      title: '微信昵称',
      dataIndex: 'nickName',
      key: 'nickName',
    },
    {
      title: '是否管理员',
      dataIndex: 'isAdmin',
      key: 'isAdmin',
      render: (_, records) => {
        return records.isAdmin ? '是' : '否';
      },
    },
    {
      title: '操作',
      render: (_, record) => {
        return (
          <Button
            type="primary"
            onClick={() => {}}
          >
            {record.isAdmin ? '更改为用户' : '更改为管理'}
          </Button>
        );
      },
    },
  ];

  return (
    <Layout
      curActive="/userManage"
      defaultOpen={['/userManage']}
    >
      <UserManageSearchForm
        onSearch={(params) => {
          const { nickName } = params || {};
          console.log('nickName', nickName);
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
          }}
          dataSource={wxUserInfoMock}
          columns={columns}
        />
      </div>
    </Layout>
  );
}
