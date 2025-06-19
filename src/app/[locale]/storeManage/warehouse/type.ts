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
  lCameraCode: string;
  rCameraCode: string;
  lCameraId: string;
  rCameraId: string;
  isValid: number;
  isNeedCheck: number;
  qrCode: string;
  longitude: number;
  latitude: number;
  manageStation: number;
  manageRoad: number;
  manageRoadName:string;
  manageStationName:string;
}

export interface WarehouseInventory {
  djbh: string;
  id: number;
  materialCode: string;
  materialId: number;
  materialName: string;
  position: string;
  sl: number;
  creatorName: string;
  wxCreatorName: string;
  warehouseId: number;
  warehouseName: string;
  unit: string;
  threshold:number;
}
