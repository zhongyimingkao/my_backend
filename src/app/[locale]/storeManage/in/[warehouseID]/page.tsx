'use client';

import Layout from '@/components/Layout';
import styles from './index.module.less';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

import { useEffect, useState } from 'react';
import { StoreIn } from '../../common/type';
import { Button, List, message, Modal, Table, TableProps, theme } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import StoreSearchForm from '../../common/Search';
import {
  QueryPageInboundReq,
  queryPageInDetail,
  queryPageInbound,
} from '../../common/api';
import { formatDate } from '@/utils';
import { WarehouseInventory } from '../../warehouse/type';
import { useParams } from 'next/navigation';

const PAGE_SIZE = 10;

export default function StoreInList() {
  const [data, setData] = useState<StoreIn[]>();
  const { token } = theme.useToken();
  const [total, setTotal] = useState<number>(0);
  const { warehouseID } = useParams();
  const [current, setCurrent] = useState<number>(1);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [detail, setDetail] = useState<WarehouseInventory[]>([]);
  const [currentSearchParams, setCurrentSearchParams] =
    useState<QueryPageInboundReq>();
  const [selectedWarehouses, setSelectedWarehouses] = useState<number[]>([]);

  const listStyle: React.CSSProperties = {
    background: 'white',
    border:'1px solid #ddd',
    borderRadius: token.borderRadiusLG,
    padding: 12,
  };

  const onPageChange = (page: number, pageSize: number) => {
    setCurrent(page);
  };

  const queryStoreInData = (searchParams?: QueryPageInboundReq) => {
    const warehouseIds =
      warehouseID === 'all'
        ? selectedWarehouses.length > 0
          ? selectedWarehouses
          : undefined
        : [Number(warehouseID)];

    queryPageInbound({
      pageSize: PAGE_SIZE,
      pageNum: current,
      ...(warehouseIds && { warehouseIds }),
      ...searchParams,
    }).then((res) => {
      setData(res.records);
      setTotal(res.total);
    });
  };

  const handleExport = async () => {
    try {
      const warehouseIds =
        warehouseID === 'all'
          ? selectedWarehouses.length > 0
            ? selectedWarehouses
            : undefined
          : [Number(warehouseID)];

      const res = await queryPageInbound({
        pageSize: 10000,
        pageNum: 1,
        ...(warehouseIds && { warehouseIds }),
        ...currentSearchParams,
      });

      // 转换数据为Excel格式
      const worksheet = XLSX.utils.json_to_sheet(
        res.records.map((item) => ({
          仓库名称: item.warehouseName,
          单据编号: item.djbh,
          入库人: item.creatorName,
          入库时间: item.rkTime,
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
      saveAs(data, `入库记录_${new Date().toISOString().slice(0, 10)}.xlsx`);

      message.success('导出成功');
    } catch (error) {
      message.error('导出失败');
      console.error('导出异常:', error);
    }
  };

  const columns: TableProps<StoreIn>['columns'] = [
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
      title: '入库人',
      dataIndex: 'creatorName',
      key: 'creatorName',
      render: (_, { creatorName, wxCreatorName }) => {
        return creatorName || wxCreatorName;
      },
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
      curActive={`/storeManage/in/${
        warehouseID === 'all' ? 'all' : ':warehouseID'
      }`}
    >
      <main className={styles.warehouseWrap}>
        <div className={styles.content}>
          <StoreSearchForm
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
              queryStoreInData({
                pageNum: current,
                pageSize: PAGE_SIZE,
                ...commonObj,
                ...searchParams,
              });
            }}
            warehouseID={warehouseID as string}
            onWarehouseChange={setSelectedWarehouses}
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
                <DownloadOutlined style={{ marginLeft: 5 }} />
              </Button>
            </div>
            <h3>入库信息列表</h3>
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
                        {'物资名称: ' + item.materialName}
                      title={
                        <span style={{ fontSize: 20 }}>
                          {'物资名称: ' + item.materialName}
                        </span>
                      }
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
