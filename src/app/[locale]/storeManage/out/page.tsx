'use client';

import Layout from '@/components/Layout';
import styles from './index.module.less';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

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
  const [total, setTotal] = useState<number>(0);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [detail, setDetail] = useState<WarehouseInventory[]>([]);
  const [currentSearchParams, setCurrentSearchParams] =
    useState<QueryPageOutboundReq>();
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
      setTotal(res.total); // 设置总条数
    });
  };

  // 3. 在组件内部添加导出逻辑
  const handleExport = async () => {
    try {
      const res = await queryPageOutbound({
        pageSize: 10000,
        pageNum: 1,
        ...currentSearchParams, // 需要先保存当前搜索条件
      });

      // 转换数据为Excel格式
      const worksheet = XLSX.utils.json_to_sheet(
        res.records.map((item) => ({
          仓库名称: item.warehouseName,
          单据编号: item.djbh,
          出库状态: statusMap.get(item.status),
          出库人: item.creatorName,
          出库时间: item.ckTime,
        }))
      );

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, '入库记录');
      const excelBuffer = XLSX.write(workbook, {
        bookType: 'xlsx',
        type: 'array',
      });

      // 生成文件并触发下载
      const data = new Blob([excelBuffer], {
        type: 'application/octet-stream',
      });
      saveAs(data, `出库记录_${new Date().toISOString().slice(0, 10)}.xlsx`);

      message.success('导出成功');
    } catch (error) {
      message.error('导出失败');
      console.error('导出异常:', error);
    }
  };

  const columns: TableProps<StoreOut>['columns'] = [
    { title: '单据id', dataIndex: 'id', key: 'id', hidden: true },
    {
      title: '仓库名称',
      dataIndex: 'warehouseName',
      key: 'warehouseName',
    },
    {
      title: '所属局',
      dataIndex: 'manageStationName',
      key: 'manageStationName',
    },
    {
      title: '所属路段',
      dataIndex: 'manageRoadName',
      key: 'manageRoadName',
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
      render: (_, { creatorName, wxCreatorName }) => {
        return creatorName || wxCreatorName;
      },
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
              type="link"
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
    console.log('current',current);
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
              setCurrentSearchParams(searchParams);
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
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-start', // 右对齐
                marginBottom: 20,
                gap: 8, // 按钮间距
              }}
            >
              <Button
                type="primary"
                onClick={handleExport}
              >
                导出Excel
              </Button>
            </div>
            <h3>出库信息列表</h3>
            <Table
              columns={columns}
              dataSource={data}
              pagination={{
                pageSize: PAGE_SIZE,
                current,
                onChange: onPageChange,
                total
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
