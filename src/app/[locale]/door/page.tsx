'use client';
import Layout from '@/components/Layout';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
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
  const [total, setTotal] = useState<number>(0);
  const { token } = theme.useToken();
  const [currentSearchParams, setCurrentSearchParams] =
    useState<QueryDoorInfoReq>();

  const listStyle: React.CSSProperties = {
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

  // 3. 在组件内部添加导出逻辑
  const handleExport = async () => {
    try {
      const res = await queryDoorInfo({
        pageSize: 10000,
        pageNum: 1,
        ...currentSearchParams, // 需要先保存当前搜索条件
      });

      // 转换数据为Excel格式
      const worksheet = XLSX.utils.json_to_sheet(
        res.records.map((item) => ({
          仓库名称: item.warehouseName,
          仓库编码: item.warehouseCode,
          类型: item.type === 'open' ? '开门' : '关门',
          操作时间: item.time,
          操作人: item.openUser,
        }))
      );

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, '开关门记录');
      const excelBuffer = XLSX.write(workbook, {
        bookType: 'xlsx',
        type: 'array',
      });

      // 生成文件并触发下载
      const data = new Blob([excelBuffer], {
        type: 'application/octet-stream',
      });
      saveAs(data, `开关门记录_${new Date().toISOString().slice(0, 10)}.xlsx`);

      message.success('导出成功');
    } catch (error) {
      message.error('导出失败');
      console.error('导出异常:', error);
    }
  };

  const getDoorInfo = (params?: QueryDoorInfoReq) => {
    queryDoorInfo({
      pageNum: current,
      pageSize: PAGE_SIZE,
      ...params,
    })
      .then((res) => {
        setDoorInfo(res.records);
        setTotal(res.total);
      })
      .catch(() => {
        message.error('查询开关门记录失败');
      });
  };

  useEffect(() => {
    getDoorInfo();
  }, [current]);

  return (
    <Layout
      curActive="/door"
      defaultOpen={['/door']}
    >
      <DoorSearchForm
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
          getDoorInfo({
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
            total
          }}
          dataSource={doorInfo}
          columns={columns}
        />
      </div>
    </Layout>
  );
}
