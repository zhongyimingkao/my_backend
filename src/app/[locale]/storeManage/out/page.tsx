'use client';

import Layout from '@/components/Layout';
import styles from './index.module.less';

import { useEffect, useState } from 'react';
import { StoreOut } from '../common/type';
import {
  Button,
  Card,
  List,
  message,
  Modal,
  Space,
  Table,
  TableProps,
  theme,
} from 'antd';
import StoreSearchForm from '../common/Search';
import {
  QueryPageOutboundReq,
  checkOutBound,
  queryPageOutDetail,
  queryPageOutbound,
} from '../common/api';
import { formatDate } from '@/utils';
import { WarehouseInventory } from '../warehouse/type';

const PAGE_SIZE = 10;

const statusMap = new Map<number, string>([
  [0, '待审核'],
  [1, '已审核'],
  [2, '审核失败'],
]);

export default function StoreOutList() {
  const [data, setData] = useState<StoreOut[]>();
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
    { title: '单据id', dataIndex: 'id', key: 'id', hidden: true },
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
      title: '出库状态',
      dataIndex: 'status',
      key: 'status',
      render: (value) => {
        return statusMap.get(value);
      },
    },
    {
      title: '出库人',
      dataIndex: 'creatorName',
      key: 'creatorName',
    },
    {
      title: '出库时间',
      dataIndex: 'ckTime',
      key: 'ckTime',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => {
        return (
          <Space>
            <Button
              type='link'
              onClick={() => {
                setModalVisible(true);
                queryPageOutDetail(record.djbh)
                  .then((res) => {
                    setDetail(res);
                  })
                  .catch(() => {
                    message.error('查询出库单明细失败');
                  });
              }}
            >
              查询出库单明细
            </Button>
            <Button
              type="link"
              disabled={record.status !== 0}
              onClick={() => {
                checkOutBound({ id: record.id, status: 1 }).then(() => {
                  message.success('审核成功');
                  setTimeout(() => queryStoreOutData(), 100);
                });
              }}
            >
              通过
            </Button>
            <Button
              type="link"
              disabled={record.status !== 0}
              onClick={() => {
                checkOutBound({ id: record.id, status: 2 }).then(() => {
                  message.success('审核成功');
                  setTimeout(() => queryStoreOutData(), 100);
                });
              }}
            >
              拒绝
            </Button>
          </Space>
        );
      },
    },
  ];

  useEffect(() => {
    queryStoreOutData();
  }, [current]);

  return (
    <Layout
      curActive="/storeManage/out"
      defaultOpen={['/storeManage']}
    >
      <main className={styles.warehouseWrap}>
        <div className={styles.content}>
          <StoreSearchForm
            type="out"
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
              queryStoreOutData({
                pageNum: current,
                pageSize: PAGE_SIZE,
                ...commonObj,
                ...searchParams,
              });
            }}
          />
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
          <Modal
            open={modalVisible}
            footer={null}
            onCancel={() => setModalVisible(false)}
          >
            <List
              className="demo-loadmore-list"
              itemLayout="horizontal"
              dataSource={detail}
              size="large"
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
