type role = "customer" | "organiser" | "";

export default interface IRegister {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: role;
}