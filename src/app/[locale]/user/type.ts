export interface Warehouse {
  createTime: string;
  creator: number;
  creatorName: string;
  id: number;
  modifier: number;
  modifierName: string;
  modifyTime: string;
  remark: string;
  status: number;
  warehouseAddr: string;
  warehouseCode: string;
  warehouseName: string;
  manageRoad: number; // 所属道路ID
  manageRoadName: string; // 道路名称
  manageStation: number; // 所属局ID
  manageStationName: string; // 局名称
  qrCode: string;
  lCameraId: string;
  rCameraId: string;
  latitude:number;
  longitude:number;
  isValid:number;
  isNeedCheck:number;
}


// 道路信息
export interface Road {
  roadID: number;
  roadName: string;
  warehouses: Warehouse[];  // 下属仓库列表
}

// 局级单位
export interface Station {
  manageRoad: Road[];       // 下属道路列表
  manageStation: string;    // 局名称
  manageStationID: number;  // 局ID
}
