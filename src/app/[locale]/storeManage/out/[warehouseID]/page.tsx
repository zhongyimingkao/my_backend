'use client';

import Layout from '@/components/Layout';
import styles from './index.module.less';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

import { useEffect, useState } from 'react';
import { StoreOut } from '../../common/type';
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
  Image,
  Badge,
  Tooltip,
  Carousel,
} from 'antd';
import {
  DownloadOutlined,
  EyeOutlined,
  PictureOutlined,
  LeftOutlined,
  RightOutlined,
  CheckOutlined,
  CloseOutlined
} from '@ant-design/icons';
import { useResponsive } from '@/hooks/useResponsive';
import MobileCardList from '@/components/MobileCardList';
import StoreSearchForm from '../../common/Search';
import {
  QueryPageOutboundReq,
  checkOutBound,
  queryPageOutDetail,
  queryPageOutbound,
} from '../../common/api';
import { formatDate } from '@/utils';
import {
  parseImageUrls,
  convertToAccessibleUrl,
  createImagePreviewData,
  ImagePreviewData
} from '@/utils/imageUtils';
import { WarehouseInventory } from '../../warehouse/type';
import { useParams } from 'next/navigation';

const PAGE_SIZE = 10;

const statusMap = new Map<number, string>([
  [0, '待审核'],
  [1, '已审核'],
  [2, '审核失败'],
]);

export default function StoreOutList() {
  const [data, setData] = useState<StoreOut[]>();
  const { token } = theme.useToken();
  const { isMobile } = useResponsive();
  const [current, setCurrent] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const { warehouseID } = useParams();
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [imagePreviewVisible, setImagePreviewVisible] = useState<boolean>(false);
  const [detail, setDetail] = useState<WarehouseInventory[]>([]);
  const [previewImages, setPreviewImages] = useState<ImagePreviewData[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [currentSearchParams, setCurrentSearchParams] =
    useState<QueryPageOutboundReq>();
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

  // 处理图片预览
  const handleImagePreview = (picUrl?: string) => {
    const imageData = createImagePreviewData(picUrl);
    if (imageData.length === 0) {
      message.info('暂无出库图片');
      return;
    }
    setPreviewImages(imageData);
    setCurrentImageIndex(0);
    setImagePreviewVisible(true);
  };

  const queryStoreOutData = (searchParams?: QueryPageOutboundReq) => {
    const warehouseIds = warehouseID === 'all' 
      ? selectedWarehouses.length > 0 ? selectedWarehouses : undefined
      : [Number(warehouseID)];
    
    queryPageOutbound({
      pageSize: PAGE_SIZE,
      pageNum: current,
      ...(warehouseIds && { warehouseIds }),
      ...searchParams,
    }).then((res) => {
      setData(res.records);
      setTotal(res.total);
    });
  };

  // 导出Excel逻辑
  const handleExport = async () => {
    try {
      const warehouseIds = warehouseID === 'all' 
        ? selectedWarehouses.length > 0 ? selectedWarehouses : undefined
        : [Number(warehouseID)];

      const res = await queryPageOutbound({
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
          出库状态: statusMap.get(item.status),
          出库人: item.creatorName,
          出库时间: item.ckTime,
          图片数量: parseImageUrls(item.picUrl).length,
        }))
      );

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, '出库记录');
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
      title: '出库图片',
      dataIndex: 'picUrl',
      key: 'picUrl',
      width: 120,
      render: (picUrl: string) => {
        const images = parseImageUrls(picUrl);
        if (images.length === 0) {
          return <span style={{ color: '#999' }}>无图片</span>;
        }

        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Badge count={images.length} size="small">
              <Button
                type="primary"
                size="small"
                icon={<EyeOutlined />}
                onClick={() => handleImagePreview(picUrl)}
              >
                预览
              </Button>
            </Badge>
            <Tooltip title={`共${images.length}张图片`}>
              <PictureOutlined style={{ color: '#1890ff' }} />
            </Tooltip>
          </div>
        );
      },
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
    console.log('current', current);
    queryStoreOutData();
  }, [current]);

  return (
    <Layout
    curActive={`/storeManage/out/${
      warehouseID === 'all' ? 'all' : ':warehouseID'
    }`}    >
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
            warehouseID={warehouseID as string}
            onWarehouseChange={setSelectedWarehouses}
          />
          <div style={listStyle}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-start',
                marginBottom: 20,
                gap: 8,
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
            <h3>出库信息列表</h3>
            {isMobile ? (
              <MobileCardList
                items={data?.map(storeOut => {
                  const images = parseImageUrls(storeOut.picUrl);
                  const statusColor = storeOut.status === 0 ? 'orange' : storeOut.status === 1 ? 'green' : 'red';
                  
                  return {
                    id: storeOut.djbh,
                    title: storeOut.warehouseName,
                    subtitle: `单据编号: ${storeOut.djbh}`,
                    description: `出库人: ${storeOut.creatorName || storeOut.wxCreatorName}`,
                    tags: [
                      {
                        label: statusMap.get(storeOut.status) || '未知状态',
                        color: statusColor
                      },
                      {
                        label: `图片: ${images.length}张`,
                        color: images.length > 0 ? 'blue' : 'default'
                      }
                    ],
                    extra: (
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        出库时间: {storeOut.ckTime}
                      </div>
                    ),
                    actions: [
                      {
                        key: 'detail',
                        label: '查看明细',
                        icon: <EyeOutlined />,
                        type: 'primary' as const,
                        onClick: () => {
                          setModalVisible(true);
                          queryPageOutDetail(storeOut.djbh)
                            .then((res) => {
                              setDetail(res);
                            })
                            .catch(() => {
                              message.error('查询出库单明细失败');
                            });
                        }
                      },
                      ...(images.length > 0 ? [{
                        key: 'preview',
                        label: '预览图片',
                        icon: <PictureOutlined />,
                        onClick: () => handleImagePreview(storeOut.picUrl)
                      }] : []),
                      ...(storeOut.status === 0 ? [{
                        key: 'approve',
                        label: '通过',
                        icon: <CheckOutlined />,
                        type: 'primary' as const,
                        onClick: () => {
                          checkOutBound({ id: storeOut.id, status: 1 }).then(() => {
                            message.success('审核成功');
                            setTimeout(() => queryStoreOutData(), 100);
                          });
                        }
                      }, {
                        key: 'reject',
                        label: '拒绝',
                        icon: <CloseOutlined />,
                        danger: true,
                        onClick: () => {
                          checkOutBound({ id: storeOut.id, status: 2 }).then(() => {
                            message.success('审核成功');
                            setTimeout(() => queryStoreOutData(), 100);
                          });
                        }
                      }] : [])
                    ]
                  };
                }) || []}
                emptyText="暂无出库记录"
              />
            ) : (
              <Table
                columns={columns}
                dataSource={data}
                pagination={{
                  pageSize: PAGE_SIZE,
                  current,
                  onChange: onPageChange,
                  total
                }}
                scroll={{ x: 1200 }}
                size="middle"
              />
            )}
          </div>

          {/* 出库单明细弹窗 */}
          <Modal
            open={modalVisible}
            footer={null}
            onCancel={() => setModalVisible(false)}
            title="出库单明细"
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
                        {'物资名称: ' + item.materialName}
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

          {/* 图片预览弹窗 */}
          <Modal
            open={imagePreviewVisible}
            footer={null}
            onCancel={() => setImagePreviewVisible(false)}
            title={`出库图片预览 (${currentImageIndex + 1}/${previewImages.length})`}
            width={900}
            centered
            destroyOnClose
          >
            <div style={{ textAlign: 'center' }}>
              {previewImages.length > 0 && (
                <div>
                  {/* 主图片显示 */}
                  <div style={{
                    border: '1px solid #d9d9d9',
                    borderRadius: 8,
                    padding: 16,
                    backgroundColor: '#fafafa',
                    marginBottom: 16
                  }}>
                    <Image
                      src={previewImages[currentImageIndex]?.url}
                      alt={previewImages[currentImageIndex]?.displayName}
                      style={{ maxWidth: '100%', maxHeight: '500px' }}
                      fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
                      onError={(e) => {
                        console.error('图片加载失败:', previewImages[currentImageIndex]?.originalPath);
                        message.error('图片加载失败');
                      }}
                    />
                  </div>

                  {/* 图片信息 */}
                  <div style={{
                    marginBottom: 16,
                    padding: 12,
                    backgroundColor: '#f0f0f0',
                    borderRadius: 6,
                    fontSize: 14
                  }}>
                    <div><strong>图片名称:</strong> {previewImages[currentImageIndex]?.displayName}</div>
                    <div style={{ marginTop: 4, fontSize: 12, color: '#666', wordBreak: 'break-all' }}>
                      <strong>原始路径:</strong> {previewImages[currentImageIndex]?.originalPath}
                    </div>
                  </div>

                  {/* 图片导航 */}
                  {previewImages.length > 1 && (
                    <div style={{ marginBottom: 16 }}>
                      <Space size="large">
                        <Button
                          icon={<LeftOutlined />}
                          onClick={() => setCurrentImageIndex(Math.max(0, currentImageIndex - 1))}
                          disabled={currentImageIndex === 0}
                        >
                          上一张
                        </Button>
                        <span style={{ fontSize: 16, fontWeight: 'bold' }}>
                          {currentImageIndex + 1} / {previewImages.length}
                        </span>
                        <Button
                          icon={<RightOutlined />}
                          onClick={() => setCurrentImageIndex(Math.min(previewImages.length - 1, currentImageIndex + 1))}
                          disabled={currentImageIndex === previewImages.length - 1}
                        >
                          下一张
                        </Button>
                      </Space>
                    </div>
                  )}

                  {/* 图片缩略图网格 */}
                  {previewImages.length > 1 && (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                      gap: 8,
                      maxHeight: 200,
                      overflowY: 'auto',
                      padding: 8,
                      backgroundColor: '#f9f9f9',
                      borderRadius: 6
                    }}>
                      {previewImages.map((img, index) => (
                        <div
                          key={index}
                          style={{
                            border: index === currentImageIndex ? '3px solid #1890ff' : '1px solid #d9d9d9',
                            borderRadius: 6,
                            padding: 2,
                            cursor: 'pointer',
                            backgroundColor: 'white',
                            transition: 'all 0.2s',
                          }}
                          onClick={() => setCurrentImageIndex(index)}
                          onMouseEnter={(e) => {
                            if (index !== currentImageIndex) {
                              e.currentTarget.style.borderColor = '#40a9ff';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (index !== currentImageIndex) {
                              e.currentTarget.style.borderColor = '#d9d9d9';
                            }
                          }}
                        >
                          <Image
                            src={img.url}
                            alt={`缩略图 ${index + 1}`}
                            width={70}
                            height={70}
                            style={{ objectFit: 'cover', borderRadius: 4 }}
                            preview={false}
                          />
                          <div style={{
                            fontSize: 10,
                            textAlign: 'center',
                            marginTop: 2,
                            color: index === currentImageIndex ? '#1890ff' : '#666'
                          }}>
                            {index + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </Modal>
        </div>
      </main>
    </Layout>
  );
}
