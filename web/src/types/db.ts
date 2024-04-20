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
