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
    createdAt:Date;
    updatedAt:Date;
}