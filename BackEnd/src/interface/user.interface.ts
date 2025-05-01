export interface IRegisterParam {
    email: string,
    password: string,
    first_name: string,
    last_name: string,
    status_role: string,
    referral_code: string
}

export interface ILoginParam {
    email: string,
    password: string
}

export interface IUpdateProfileParam {
    first_name?: string;
    last_name?: string;
    email?: string;
    profile_pict?: string;
    point?: number;
    is_verified?: string;
    new_password?: string;
    old_password?: string; // Required if changing password
}

export interface IEvent {
    name: string;
    location: string;
    start_date: string;
    end_date: string;
    quota: number;
    status: string;
    description: string;
    price: number;
}