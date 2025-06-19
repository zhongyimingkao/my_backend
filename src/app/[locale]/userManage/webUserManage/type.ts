export interface UserInfo {
  address: string | null;
  age: number;
  createTime: string;
  creator: number;
  creatorName: string;
  departmentId: number;
  departmentName: string;
  id: string;
  idCard: string | null;
  loginName: string;
  modifier: number;
  modifierName: string;
  modifyTime: string;
  password: string;
  phone: string | null;
  role: number;
  roleName: string;
  sex: string | null;
  userName: string;
  userType: string | null;
  wxId: string | null;
  identityNum: string | null;
}

export interface QueryUserInfoReq {
  nickName?: string;
}
