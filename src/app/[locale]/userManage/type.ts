export interface WxUserInfo {
  id:number;
  avatarUrl:string;
  openid: string;
  nickName: string;
  role: 'admin' | 'user',
  sessionKey:string;
}

export interface QueryUserInfoReq {
  nickName?: string;
}
