export interface IRegisterParam {
    email: string,
    password: string,
    first_name: string,
    last_name: string,
    status_role: number,
    referral_code: string
}

export interface ILoginParam {
    email: string,
    password: string
}

export interface IUpdateProfileParam {
    userId: number;
    first_name?: string;
    last_name?: string;
    email?: string;
    profile_pict?: string;
    new_password?: string;
    old_password?: string; // Required if changing password
  }