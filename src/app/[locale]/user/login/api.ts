import req from '@/utils/req';
import { FieldType } from './page';

export const loginApi = (params: FieldType): any =>
  req.post('/userController/login', { ...params });
