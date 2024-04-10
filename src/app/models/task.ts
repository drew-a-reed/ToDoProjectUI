export interface ITask{
  [x: string]: any;
  id?: string,
  title?: string,
  description?: string,
  status: string,
  done: boolean,
  assignedDate?: any,
  dueDate?: any
}
