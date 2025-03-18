export interface RoleInfo {
  id: number;
  roleName: string;
  roleDescription?: string;
  createTime: string;
  creator: number;
  creatorName: string;
  modifier: number;
  modifierName: string;
  modifyTime: string;
  permissions: string[]; // 权限列表，假设是字符串数组
}



export interface QueryRoleInfoReq {
  roleName?: string;
}
