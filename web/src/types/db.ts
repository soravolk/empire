export interface LongTermItem {
  id: number;
  user_id: string;
  start_time: Date;
  end_time: Date;
}

export interface CycleItem {
  id: number;
  long_term_id: number;
  start_time: Date;
  end_time: Date;
}

export interface CycleCategoryItem {
  id: number;
  cycle_id: number;
  category_id: number;
  name: string;
}

export interface CycleSubcategoryItem {
  id: number;
  cycle_id: number;
  category_id: number;
  subcategory_id: number;
  name: string;
}

export interface CycleContentItem {
  id: number;
  cycle_id: number;
  subcategory_id: number;
  content_id: number;
  name: string;
}

export interface ShortTermItem {
  id: number;
  user_id: string;
}

export interface Task {
  id: number;
  short_term_id: number;
  content_id: number;
  name?: string; // Make optional since we're removing it
  time_spent: number;
  finished_date: string | null;
}

export interface Subtask {
  id: number;
  task_id: number;
  name: string;
  description?: string;
  time_spent: number;
  finished_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  display_name: string;
  group_id: number;
}

// Goals
export interface GoalItem {
  id: number;
  user_id: number | string; // backend may return numeric, while app User.id is string
  long_term_id: number;
  statement: string; // max 280 chars enforced server-side/UI
  category_ids?: number[];
  created_at?: string; // ISO date-time
  updated_at?: string; // ISO date-time
}

export interface GoalCreate {
  long_term_id: number;
  statement: string;
  category_ids?: number[];
}

export interface GoalUpdate {
  statement: string;
}
