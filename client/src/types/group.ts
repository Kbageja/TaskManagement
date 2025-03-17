export interface Task {
    id: number;
    userId: string;
    parentId: string;
    groupId: number;
    TaskName: string;
    Priority: string;
    DeadLine: string;
    Status: string;
    UpdatedAt: string;
    CreatedAt: string;
  }
  
  export interface User {
    id: string;
    name: string;
    email: string;
    password: string;
    createdAt: string;
    role: string;
    tasks: Task[];
    parentUsers?: ParentUser[]; // Make `parentUsers` optional
  }
  
  export interface ParentUser {
    id: number;
    parentId: string;
    userId: string;
    groupId: number;
    role: string;
    level: number;
    user: User;
  }
  
  export interface Group {
    id: number;
    name: string;
    ownerId: string;
    createdAt: string;
    members: Member[];
    tasks: Task[];
  }

  export interface GroupLevelWise {
    id: number;
    name: string;
    ownerId: string;
    createdAt: string;
    members: MembersLevel[];
    userLevel:number;
  }

  export interface MembersLevel {
    id: number;
    name: string;
    level:number;
    // Add other member properties as needed
  }
  
  export  interface Member {
    id: number;
    groupId: number;
    userId: string;
    role: string;
    level: number;
    user: User;
  }
  
  export  interface DummyDataType {
      message: string;
      Data: Group[];
    }

  export  interface GroupLevelData {
      message: string;
      Data: GroupLevelWise[];
    }