import { LongTermItem } from "../types";

const getLongTermHistoryOptions = (items: LongTermItem[]) => {
  return items.map((item: LongTermItem) => {
    const start_date = new Date(item.start_time);
    const end_date = new Date(item.end_time);
    const formatter = new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
    });
    return `${formatter.format(start_date)} - ${formatter.format(end_date)}`;
  });
};

export { getLongTermHistoryOptions };
