import req from '@/utils/req';
import { Warehouse } from '@/app/[locale]/user/type';

/**
 * 获取当前用户有权限的仓库列表
 * @returns Promise<Warehouse[]>
 */
export const getUserAuthorizedWarehouses = async (): Promise<Warehouse[]> => {
  try {
    // 获取用户信息
    const userRes = await req.get('userController/getUserInfo');
    if (userRes.code !== 200) {
      throw new Error('获取用户信息失败');
    }

    const userInfo = userRes.data;
    const userRole = userInfo.role;

    // 如果是超级管理员(role=2)，返回所有仓库
    if (userRole === 2) {
      const warehouseRes = await req.post('/warehouseController/pageWarehouse', {
        pageNum: 1, 
        pageSize: 1000
      });
      if (warehouseRes.code === 200) {
        return warehouseRes.data.records || [];
      }
      return [];
    }

    // 普通管理员，获取角色权限的仓库
    if (userInfo.role) {
      const roleRes = await req.get(`/roleController/getRoleById`, {
        params: { id: userInfo.role }
      });
      
      if (roleRes.code === 200 && roleRes.data.permissions) {
        // 权限数组中包含仓库ID，直接提取数字ID
        const warehouseIds = roleRes.data.permissions
          .filter((perm: string) => !isNaN(Number(perm))) // 过滤出纯数字的权限（仓库ID）
          .map((perm: string) => parseInt(perm));

        if (warehouseIds.length > 0) {
          // 根据权限的仓库ID获取仓库详情
          const warehouseRes = await req.post('/warehouseController/pageWarehouse', {
            pageNum: 1,
            pageSize: 1000
          });
          
          if (warehouseRes.code === 200) {
            // 过滤出有权限的仓库
            const allWarehouses = warehouseRes.data.records || [];
            return allWarehouses.filter((warehouse: Warehouse) => 
              warehouseIds.includes(warehouse.id)
            );
          }
        }
      }
    }

    // 如果没有特定权限，返回空数组
    return [];
  } catch (error) {
    console.error('获取用户权限仓库失败:', error);
    return [];
  }
};

/**
 * 检查用户是否有某个仓库的权限
 * @param warehouseId 仓库ID
 * @returns Promise<boolean>
 */
export const checkWarehousePermission = async (warehouseId: number): Promise<boolean> => {
  try {
    const authorizedWarehouses = await getUserAuthorizedWarehouses();
    return authorizedWarehouses.some(warehouse => warehouse.id === warehouseId);
  } catch (error) {
    console.error('检查仓库权限失败:', error);
    return false;
  }
};

/**
 * 获取用户角色信息
 * @returns Promise<{role: number, isAdmin: boolean}>
 */
export const getUserRole = async (): Promise<{role: number, isAdmin: boolean}> => {
  try {
    const userRes = await req.get('userController/getUserInfo');
    if (userRes.code === 200) {
      const userInfo = userRes.data;
      return {
        role: userInfo.role,
        isAdmin: userInfo.role === 2
      };
    }
    throw new Error('获取用户角色失败');
  } catch (error) {
    console.error('获取用户角色失败:', error);
    return { role: 0, isAdmin: false };
  }
};