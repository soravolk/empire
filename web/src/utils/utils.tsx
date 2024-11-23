import { CycleItem, LongTermItem, ShortTermItem } from "../types";

const getLongTermHistoryOptions = (items: LongTermItem[]) => {
  return items.map((item: LongTermItem) => {
    const start_date = new Date(item.start_time);
    const end_date = new Date(item.end_time);
    const formatter = new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
    });
    return {
      data: item,
      displayText: `${formatter.format(start_date)} - ${formatter.format(
        end_date
      )}`,
    };
  });
};

const getAvailableCycleOptions = (items: CycleItem[]) => {
  return items.map((item: CycleItem, index: number) => {
    return {
      data: item,
      displayText: `Cycle ${index + 1}`,
    };
  });
};

const getAvailableShortTermOptions = (items: ShortTermItem[]) => {
  return items.map((item: ShortTermItem) => {
    return {
      data: item,
      displayText: `Short Term ID: ${item.id}`,
    };
  });
};

export {
  getLongTermHistoryOptions,
  getAvailableCycleOptions,
  getAvailableShortTermOptions,
};
