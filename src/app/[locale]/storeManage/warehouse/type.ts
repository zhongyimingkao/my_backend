 export interface Warehouse {
    createTime: string;
    creator: number;
    creatorName: string;
    id: number;
    modifier: number;
    modifierName: string;
    modifyTime: string;
    remark: string;
    status: string | null;
    warehouseAddr: string;
    warehouseCode: string;
    warehouseName: string;
    lCameraCode:string;
    rCameraCode:string;
    lCameraId:string;
    rCameraId:string;
  }

  export interface WarehouseInventory {
    djbh:string;
    id: number;
    materialCode: string;
    materialId: number;
    materialName: string;
    position: string;
    sl: number;
    warehouseId: number;
    warehouseName: string;
    unit:string;
  }
  