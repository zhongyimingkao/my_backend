export interface WxUserInfo {
  openId: string;
  nickName: string;
  isAdmin: boolean;
}

export interface QueryUserInfoReq {
  nickName?: string;
}
