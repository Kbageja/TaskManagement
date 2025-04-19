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

  export interface UserProfile {
    name: string;
    email: string;
    groups: {
      id: number;
      name: string;
    }[];
  }
  