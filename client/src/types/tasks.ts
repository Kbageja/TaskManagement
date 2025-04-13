export interface Tasks{
    TaskName:string;
    Priority:string;
    DeadLine:Date;
    Status:string;
    groupId:string;
    userId:string;
}
export interface UpdatedTask{
    id:number;
    TaskName:string;
    Priority:string;
    DeadLine:Date;
    Status:string;
    groupId:number;
    userId:string;
    parentId:string;
    CreatedAt:Date;
    UpdatedAt:Date;
}

  export  interface TaskUserData {
      message: string;
      Data: UpdatedTask[];
    }
    export interface TrendsData {
        collectiveTrends: Record<string, number>;
        groupWiseTrends: Record<string, Record<string, number>>;
      }
      