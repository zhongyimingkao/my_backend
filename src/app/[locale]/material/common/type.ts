export interface MaterialInfo {
  id: number;
  materialCode: string;
  materialName: string;
  materialType: number;
  materialTypeName: string;
  remark: string;
  unit: string;
  specification: string;
}

export interface MaterialType {
  id: number;
  typeName: string;
}
