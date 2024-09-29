export interface handleDoorInfo {
  time: string;
  type: 'open' | 'close';
  warehouseCode: string;
  warehouseName: string;
  openUser: string;
}

export interface QueryDoorInfoReq {
  end?: string;
  start?: string;
  timeRange?: string[];
  wareHouse?: string;
}
