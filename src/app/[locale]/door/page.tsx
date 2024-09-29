'use client';
import Layout from '@/components/Layout';
import { Button, message, Table, TableProps, theme } from 'antd';
import { useEffect, useState } from 'react';
import DoorSearchForm from './Search';
import { Niconne } from 'next/font/google';
import { handleDoorInfo, QueryDoorInfoReq } from './type';
import { queryDoorInfo } from './api';
import { formatDate } from '@/utils';
const PAGE_SIZE = 10;

export default function Door() {
  const [current, setCurrent] = useState<number>(1);
  const [doorInfo, setDoorInfo] = useState<handleDoorInfo[]>([]);
  const { token } = theme.useToken();

  const listStyle: React.CSSProperties = {
    background: token.colorFillAlter,
    borderRadius: token.borderRadiusLG,
    padding: 12,
  };

  const onPageChange = (page: number, pageSize: number) => {
    setCurrent(page);
  };
  const columns: TableProps<handleDoorInfo>['columns'] = [
    {
      title: '仓库名称',
      dataIndex: 'warehouseName',
      key: 'warehouseName',
    },
    {
      title: '仓库编码',
      dataIndex: 'warehouseCode',
      key: 'warehouseCode',
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (_, records) => {
        return records.type === 'open' ? '开门' : '关门';
      },
    },
    {
      title: '操作时间',
      dataIndex: 'time',
      key: 'time',
    },
    {
      title: '操作人',
      dataIndex: 'openUser',
      key: 'openUser',
    },
  ];

  const getDoorInfo = (params?: QueryDoorInfoReq) => {
    queryDoorInfo({
      pageNum: current,
      pageSize: PAGE_SIZE,
      ...params,
    })
      .then((res) => {
        setDoorInfo(res.records);
      })
      .catch(() => {
        message.error('查询开关门记录失败');
      });
  };

  useEffect(() => {
    getDoorInfo();
  }, []);

  return (
    <Layout
      curActive="/door"
      defaultOpen={['/door']}
    >
      <DoorSearchForm
        onSearch={(searchParams) => {
          const { timeRange } = searchParams || {};
          const start = formatDate(new Date(timeRange?.[0] || ''));
          const end = formatDate(new Date(timeRange?.[1] || ''));
          delete searchParams?.timeRange;
          const commonObj: any = {};
          if (!!timeRange && !!start && !!end) {
            commonObj['start'] = start;
            commonObj['end'] = end;
          }
          queryDoorInfo({
            pageNum: current,
            pageSize: PAGE_SIZE,
            ...commonObj,
            ...searchParams,
          });
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
          <h3>开关门记录</h3>
        </div>
        <Table
          pagination={{
            pageSize: PAGE_SIZE,
            current,
            onChange: onPageChange,
          }}
          dataSource={doorInfo}
          columns={columns}
        />
      </div>
    </Layout>
  );
}
