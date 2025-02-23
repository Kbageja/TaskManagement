export type registerData = {
    name:string,
    email: string;
    password: string;
  };

export type loginData = {
    email: string;
    password: string;
  };

  export type verifyEmailData = {
    userId:string,
    name:string,
    email: string;
    password: string;
  };