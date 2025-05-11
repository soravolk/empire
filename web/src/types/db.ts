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

export interface Detail {
  id: number;
  short_term_id: number;
  content_id: number;
  name: string;
  time_spent: number;
}

export interface User {
  id: string;
  email: string;
  display_name: string;
  group_id: number;
}
