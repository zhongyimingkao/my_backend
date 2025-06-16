import req from '@/utils/req';
import { DepartmentInfo, RoadPO } from './type'; // 假设已经定义了DepartmentInfo类型

interface Admin {
  id: number;
  name: string;
  role: string;
}

export const fetchAdminsByWarehouseId = (warehouseId: number): Promise<Admin[]> => {
  return new Promise((resolve, reject) => {
    req
      .get('/adminController/getAdminsByWarehouse', {
        params: { warehouseId }
      })
      .then((res: any) => {
        if (res.code === 200) {
          resolve(res.data);
        } else {
          reject(res);
        }
      })
      .catch((e) => {
        reject(e);
      });
  });
};

// 查询部门列表
export const queryDepartmentList = (): Promise<any> => {
  return req
    .post('/departmentController/getDepartment')
    .then((res: any) => {
      if (res.code === 200) {
        return res.data;
      }
      throw new Error(res.message || '查询部门列表失败');
    });
};

// 新增部门
export const addDepartment = (params: Partial<DepartmentInfo>): Promise<any> => {
  return req
    .post('/departmentController/addDepartment', params)
    .then((res: any) => {
      if (res.code === 200) {
        return res.data;
      }
      throw new Error(res.message || '新增部门失败');
    });
};

// 更新部门信息
export const updateDepartmentInfo = (params: Partial<DepartmentInfo>): Promise<any> => {
  return req
    .post('/departmentController/updateDepartment', params)
    .then((res: any) => {
      if (res.code === 200) {
        return res.data;
      }
      throw new Error(res.message || '更新部门信息失败');
    });
};

// 删除部门
export const deleteDepartmentInfo = (id: number): Promise<any> => {
  return req
    .delete('/departmentController/deleteDepartmentById', {
      params: { id },
    })
    .then((res: any) => {
      if (res.code === 200) {
        return res.data;
      }
      throw new Error(res.message || '删除部门失败');
    });
};


// 保存路段
export const saveRoad = (params: Partial<RoadPO>): Promise<any> => {
  return req
    .post('/departmentController/saveRoad', params)
    .then((res: any) => {
      if (res.code === 200) {
        return res.data;
      }
      throw new Error(res.message || ' 保存路段信息失败');
    });
};
