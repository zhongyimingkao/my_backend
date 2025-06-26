import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

// 这是一个示例文件服务接口
// 实际使用时需要根据你的文件存储方式进行调整

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const { filename } = params;
    
    // 这里需要根据实际情况配置文件存储路径
    // 示例：假设文件存储在项目的 public/uploads 目录下
    const filePath = join(process.cwd(), 'public', 'uploads', filename);
    
    try {
      const fileBuffer = await readFile(filePath);
      
      // 根据文件扩展名设置正确的 Content-Type
      const ext = filename.split('.').pop()?.toLowerCase();
      let contentType = 'application/octet-stream';
      
      switch (ext) {
        case 'jpg':
        case 'jpeg':
          contentType = 'image/jpeg';
          break;
        case 'png':
          contentType = 'image/png';
          break;
        case 'gif':
          contentType = 'image/gif';
          break;
        case 'webp':
          contentType = 'image/webp';
          break;
        case 'svg':
          contentType = 'image/svg+xml';
          break;
      }
      
      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000', // 缓存一年
        },
      });
    } catch (fileError) {
      console.error('文件读取失败:', fileError);
      return NextResponse.json(
        { error: '文件不存在' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('文件服务错误:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}