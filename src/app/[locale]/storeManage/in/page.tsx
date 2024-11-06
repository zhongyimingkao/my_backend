'use client';

import Layout from '@/components/Layout';
import styles from './index.module.less';

import { useEffect, useState } from 'react';
import { StoreIn } from '../common/type';
import { Button, List, message, Modal, Table, TableProps, theme } from 'antd';
import StoreSearchForm from '../common/Search';
import {
  QueryPageInboundReq,
  queryPageInDetail,
  queryPageInbound,
} from '../common/api';
import { formatDate } from '@/utils';
import { WarehouseInventory } from '../warehouse/type';

const PAGE_SIZE = 10;

export default function StoreInList() {
  const [data, setData] = useState<StoreIn[]>();
  const { token } = theme.useToken();
  const [current, setCurrent] = useState<number>(1);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [detail, setDetail] = useState<WarehouseInventory[]>([]);

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
      title: '单据编号',
      dataIndex: 'djbh',
      key: 'djbh',
    },
    {
      title: '入库人',
      dataIndex: 'creatorName',
      key: 'creatorName',
    },
    {
      title: '入库时间',
      dataIndex: 'rkTime',
      key: 'rkTime',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => {
        return (
          <Button
            type="link"
            onClick={() => {
              setModalVisible(true);
              queryPageInDetail(record.djbh)
                .then((res) => {
                  setDetail(res);
                })
                .catch(() => {
                  message.error('查询入库单明细失败');
                });
            }}
          >
            查询入库单明细
          </Button>
        );
      },
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
              const { timeRange } = searchParams || {};
              const start = formatDate(new Date(timeRange?.[0] || ''));
              const end = formatDate(new Date(timeRange?.[1] || ''));
              delete searchParams?.timeRange;
              const commonObj: any = {};
              if (!!timeRange && !!start && !!end) {
                commonObj['start'] = start;
                commonObj['end'] = end;
              }
              queryStoreInData({
                pageNum: current,
                pageSize: PAGE_SIZE,
                ...commonObj,
                ...searchParams,
              });
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
          <Modal
            open={modalVisible}
            footer={null}
            onCancel={() => setModalVisible(false)}
          >
            <List
              className="demo-loadmore-list"
              itemLayout="horizontal"
              dataSource={detail}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    title={
                      <span style={{ fontSize: 20 }}>
                        {'物料名称: ' + item.materialName}
                      </span>
                    }
                    description={
                      <span style={{ fontSize: 18 }}>
                        {'数量: ' +
                          (item.sl || 0) +
                          '，' +
                          '单位: ' +
                          item.unit}
                      </span>
                    }
                  />
                </List.Item>
              )}
            />
          </Modal>
        </div>
      </main>
    </Layout>
  );
}
