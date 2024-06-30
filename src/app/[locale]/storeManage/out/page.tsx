'use client';

import Layout from '@/components/Layout';
import styles from './index.module.less';

import { useEffect, useState } from 'react';
import { StoreOut } from '../common/type';
import { Table, TableProps, theme } from 'antd';
import StoreSearchForm from '../common/Search';
import {  QueryPageOutboundReq, queryPageOutbound } from '../common/api';

const PAGE_SIZE = 10;

export default function StoreOutList() {
  const [data, setData] = useState<StoreOut[]>();
  const { token } = theme.useToken();
  const [current, setCurrent] = useState<number>(1);

  const listStyle: React.CSSProperties = {
    background: token.colorFillAlter,
    borderRadius: token.borderRadiusLG,
    padding: 12,
  };

  const onPageChange = (page: number, pageSize: number) => {
    setCurrent(page);
  };

  const queryStoreOutData = (searchParams?: QueryPageOutboundReq) => {
    queryPageOutbound({
      pageSize: PAGE_SIZE,
      pageNum: current,
      ...searchParams,
    }).then((res) => {
      setData(res.records);
    });
  };

  const columns: TableProps<StoreOut>['columns'] = [
    {
      title: '仓库名称',
      dataIndex: 'warehouseName',
      key: 'warehouseName',
    },
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
      title: '出库数量',
      dataIndex: 'sl',
      key: 'sl',
    },
    {
      title: '出库时间',
      dataIndex: 'ckTime',
      key: 'ckTime',
    },
  ];

  useEffect(() => {
    queryStoreOutData();
  }, [current]);

  return (
    <Layout curActive="/storeManage/out" defaultOpen={["/storeManage"]}>
      <main className={styles.warehouseWrap}>
        <div className={styles.content}>
          <StoreSearchForm onSearch={() => {}} />
          <div style={listStyle}>
            <h3>出库信息列表</h3>
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
        </div>
      </main>
    </Layout>
  );
}
