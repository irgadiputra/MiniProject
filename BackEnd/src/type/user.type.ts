export type RegisterParam = {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    status_role: string;
    referral_code?: string;
}

export type LoginParam = {
    email: string;
    password: string;
}

export type UpdateProfileParam = {
    first_name?: string;
    last_name?: string;
    email?: string;
    profile_pict?: string;
    point?: number;
    is_verified?: string;
    new_password?: string;
    old_password?: string; // Required if changing password
}
