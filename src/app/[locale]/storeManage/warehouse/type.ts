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
  }

  export interface WarehouseInventory {
    id: number;
    materialCode: string;
    materialId: number;
    materialName: string;
    position: string;
    sl: number;
    warehouseId: number;
    warehouseName: string;
  }
  