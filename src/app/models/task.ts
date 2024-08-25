export interface ITask{
  [x: string]: any;
  taskId?: string,
  title?: string,
  description?: string,
  status: string,
  priority: string,
  done: boolean,
  assignedDate?: any,
  dueDate?: any
}
