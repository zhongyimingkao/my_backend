import { Space, Tag, type TableProps } from 'antd';
import { Warehouse } from './type';

const columns: TableProps<Warehouse>['columns'] = [
  {
    title: '仓库编码',
    dataIndex: 'warehouseCode',
    key: 'warehouseCode',
  },
  {
    title: '仓库名称',
    dataIndex: 'warehouseName',
    key: 'warehouseName',
    // render: role => role === 1 ? '超级管理员' : '开发者'
  },
  {
    title: '仓库地址',
    dataIndex: 'warehouseAddr',
    key: 'warehouseAddr',
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    render: (value) => {
      if (value === 0) return '未启动';
      return '启动中';
    },
  },
  {
    title: '操作',
    key: 'action',
    render: (_, record) => (
      <Space size="middle">
        <a>查询库存</a>
      </Space>
    ),
  },
];

export { columns };
