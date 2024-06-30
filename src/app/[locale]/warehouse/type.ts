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