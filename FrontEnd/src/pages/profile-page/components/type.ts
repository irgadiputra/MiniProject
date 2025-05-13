export interface IUpdateProfileParam {
  first_name?: string;
  last_name?: string;
  email?: string;
  point?: number;
  is_verified?: boolean;
  old_password?: string;
  new_password?: string;
}

export interface IUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  point: number;
  is_verified: boolean;
  profile_pict?: string;
}
