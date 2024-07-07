'use client';

import Layout from '@/components/Layout';
import styles from './index.module.less';

import { useEffect, useState } from 'react';
import { StoreIn } from '../common/type';
import { Table, TableProps, theme } from 'antd';
import StoreSearchForm from '../common/Search';
import { QueryPageInboundReq, queryPageInbound } from '../common/api';

const PAGE_SIZE = 10;

export default function StoreInList() {
  const [data, setData] = useState<StoreIn[]>();
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

  const queryStoreInData = (searchParams?: QueryPageInboundReq) => {
    queryPageInbound({
      pageSize: PAGE_SIZE,
      pageNum: current,
      ...searchParams,
    }).then((res) => {
      setData(res.records);
    });
  };

  const columns: TableProps<StoreIn>['columns'] = [
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
      title: '入库数量',
      dataIndex: 'sl',
      key: 'sl',
    },
    {
      title: '入库时间',
      dataIndex: 'rkTime',
      key: 'rkTime',
    },
  ];

  useEffect(() => {
    queryStoreInData();
  }, [current]);

  return (
    <Layout
      curActive="/storeManage/in"
      defaultOpen={['/storeManage']}
    >
      <main className={styles.warehouseWrap}>
        <div className={styles.content}>
          <StoreSearchForm
            onSearch={(searchParams) => {
              queryStoreInData(searchParams);
            }}
          />
          <div style={listStyle}>
            <h3>入库信息列表</h3>
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
