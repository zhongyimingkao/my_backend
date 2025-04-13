'use client';
import { useTranslations } from 'next-intl';
import { Table, theme } from 'antd';
import { useRouter } from 'next/navigation';
import AvaForm from './AvaForm';
import { columns } from './column';
import Layout from '@/components/Layout';
import styles from './index.module.less';
import { useEffect, useState } from 'react';
import { Warehouse } from './type';
import { queryWareHouse } from './api';

const PAGE_SIZE = 10;

export default function User() {
  const t = useTranslations('user');
  const { token } = theme.useToken();
  const [data, setData] = useState<Warehouse[]>([]);
  const [current, setCurrent] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  
  const queryWareHouseData = (searchParams?: Partial<Warehouse>) => {
    queryWareHouse({
      pageSize: PAGE_SIZE,
      pageNum: current,
      ...searchParams,
    }).then((res) => {
      setData(res.records);
      setTotal(res.total);
    });
  };

  const onPageChange = (page: number, pageSize: number) => {
    setCurrent(page);
  };

  const listStyle: React.CSSProperties = {
    borderRadius: token.borderRadiusLG,
    padding: 12,
  };

  useEffect(() => {
    queryWareHouseData();
  }, [current]);

  return (
    <Layout curActive="/user">
      <main className={styles.userWrap}>
        <div className={styles.content}>
          <AvaForm onSearch={queryWareHouseData} />
          <div style={listStyle}>
            <h3>仓库主信息列表</h3>
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
            />
          </div>
        </div>
      </main>
    </Layout>
  );
}
