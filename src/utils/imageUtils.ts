// 图片处理工具函数

/**
 * 解析图片URL字符串，返回图片数组
 * @param picUrl 图片URL字符串，多张图片用|||分隔
 * @returns 图片URL数组
 */
export const parseImageUrls = (picUrl?: string): string[] => {
  if (!picUrl) return [];
  return picUrl.split('|||').filter(url => url.trim() !== '');
};

/**
 * 转换本地文件路径为可访问的URL
 * @param localPath 本地文件路径
 * @returns 可访问的URL
 */
export const convertToAccessibleUrl = (localPath: string): string => {
  if (!localPath) return '';
  
  // 如果已经是HTTP URL，直接返回
  if (localPath.startsWith('http://') || localPath.startsWith('https://')) {
    return localPath;
  }
  
  // 如果是本地文件路径，转换为文件服务URL
  if (localPath.includes('C:\\') || localPath.includes('/')) {
    // 提取文件名
    const fileName = localPath.split(/[\\\/]/).pop() || '';
    
    // 返回文件服务URL
    return `/api/files/${encodeURIComponent(fileName)}`;
  }
  
  // 如果是相对路径，假设是相对于public目录
  return localPath.startsWith('/') ? localPath : `/${localPath}`;
};

/**
 * 检查图片URL是否有效
 * @param url 图片URL
 * @returns Promise<boolean>
 */
export const checkImageUrl = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok && response.headers.get('content-type')?.startsWith('image/');
  } catch {
    return false;
  }
};

/**
 * 获取图片的显示名称
 * @param url 图片URL或路径
 * @returns 显示名称
 */
export const getImageDisplayName = (url: string): string => {
  const fileName = url.split(/[\\\/]/).pop() || '';
  return fileName.replace(/^opt/, '').replace(/\.[^.]+$/, '') || '图片';
};

/**
 * 批量转换图片URL
 * @param picUrl 图片URL字符串
 * @returns 转换后的图片URL数组
 */
export const convertImageUrls = (picUrl?: string): string[] => {
  const urls = parseImageUrls(picUrl);
  return urls.map(convertToAccessibleUrl);
};

/**
 * 创建图片预览数据
 * @param picUrl 图片URL字符串
 * @returns 图片预览数据数组
 */
export interface ImagePreviewData {
  url: string;
  originalPath: string;
  displayName: string;
  index: number;
}

export const createImagePreviewData = (picUrl?: string): ImagePreviewData[] => {
  const originalUrls = parseImageUrls(picUrl);
  return originalUrls.map((originalPath, index) => ({
    url: convertToAccessibleUrl(originalPath),
    originalPath,
    displayName: getImageDisplayName(originalPath),
    index,
  }));
};