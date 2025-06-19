// 定义道路信息接口
export interface RoadPO {
  deleted: number;
  id: number;
  road: string;
  stationId: number;
}

// 定义部门信息接口
export interface DepartmentInfo {
  id: number;
  note: string | null;
  roadPOList: RoadPO[];
  stationName: string;
  deleted: number;
}
