import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import {
  useFetchLongTermsQuery,
  useFetchCyclesOfLongTermQuery,
  useFetchCategoriesFromCycleQuery,
  useFetchSubcategoriesFromCycleQuery,
  useFetchContentsFromCycleQuery,
  useFetchCurrentUserQuery,
  useCreateLongTermMutation,
  useDeleteLongTermMutation,
} from "../store";
import Dropdown from "../components/Dropdown";
import { getLongTermHistoryOptions } from "../utils/utils";
import {
  LongTermItem,
  CycleItem,
  CycleCategoryItem,
  CycleSubcategoryItem,
  User,
} from "../types";
import Cycle from "../components/Cycle";
import Category from "../components/Category";
import SubCategory from "../components/Subcategory";
import Content from "../components/Content";
import { CycleItemContext, useCycleListContext } from "../context/cycle";
import { useLongTermContext } from "../context/longTerm";
import { BsPencilSquare } from "react-icons/bs";
import { MdDelete } from "react-icons/md";

interface CreateLongTermProps {
  user: User;
}

interface DeleteLongTermProps {
  selectedLongTerm: LongTermItem;
  setSelectedLongTerm: (longTerm: LongTermItem | null) => void;
}

type DateValue = Date | null;

type CycleRange = DateValue | [DateValue, DateValue];

const CreateLongTerm: React.FC<CreateLongTermProps> = ({ user }) => {
  const [createLongTerm] = useCreateLongTermMutation();

  const [date, setDate] = useState<CycleRange>(null);
  const [expandCalendar, setExpandCalendar] = useState(false);

  const handleClick = () => {
    setExpandCalendar(!expandCalendar);
  };

  const handleSelectCycleRange = (e: CycleRange) => {
    setDate(e);
    setExpandCalendar(false);
  };

  useEffect(() => {
    if (Array.isArray(date)) {
      createLongTerm({
        userId: user.id,
        startTime: date[0],
        endTime: date[1],
      });
    }
  }, [date]);

  return (
    <div className="relative">
      <button onClick={handleClick}>
        <BsPencilSquare />
      </button>
      {expandCalendar && (
        <div className="absolute right-0 shadow-lg">
          <Calendar
            selectRange
            value={date}
            onChange={handleSelectCycleRange}
          />
        </div>
      )}
    </div>
  );
};

const DeleteLongTerm: React.FC<DeleteLongTermProps> = ({
  selectedLongTerm,
  setSelectedLongTerm,
}) => {
  const [deleteLongTerm] = useDeleteLongTermMutation();

  const handleClick = () => {
    deleteLongTerm({ id: String(selectedLongTerm.id) });
    setSelectedLongTerm(null);
  };

  return (
    <button onClick={handleClick}>
      <MdDelete />
    </button>
  );
};

export default function LongTerm() {
  const { data: userData } = useFetchCurrentUserQuery(null);
  const {
    data: longTermData,
    error: longTermError,
    isLoading: isLongTermLoading,
  } = useFetchLongTermsQuery(null);

  const { selectedLongTerm: longTerm, setSelectedLongTerm: setLongTerm } =
    useLongTermContext();
  const { setCycleList } = useCycleListContext();
  const {
    data: cycleData,
    error: cycleFetchError,
    isLoading: isCycleLoading,
  } = useFetchCyclesOfLongTermQuery(longTerm);

  useEffect(() => {
    setCycleList(cycleData);
  }, [cycleData]);

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between mb-4">
        {longTermData && (
          <Dropdown
            options={getLongTermHistoryOptions(longTermData)}
            onSelect={setLongTerm}
          />
        )}
        <div className="flex space-x-2">
          <CreateLongTerm user={userData} />
          {longTerm && (
            <DeleteLongTerm
              selectedLongTerm={longTerm}
              setSelectedLongTerm={setLongTerm}
            />
          )}
        </div>
      </div>
      <div className="flex px-5 py-2">
        {longTerm && <CycleOptions longTerm={longTerm} />}
      </div>
    </div>
  );
}

interface ItemProps {
  cycle: CycleItem;
}

interface CycleOptionsProps {
  longTerm: LongTermItem;
}

const CycleOptions: React.FC<CycleOptionsProps> = ({ longTerm }) => {
  const { cycleList } = useCycleListContext();
  const [cycle, setCycle] = useState<CycleItem | null>(null);

  return (
    <CycleItemContext.Provider value={cycle}>
      <div className="basis-1/4">
        {cycleList && (
          <Cycle
            cycles={cycleList}
            selectedCycle={cycle}
            setSelectedCycle={setCycle}
          />
        )}
      </div>
      {cycle && <Items cycle={cycle} />}
    </CycleItemContext.Provider>
  );
};

export const Items: React.FC<ItemProps> = ({ cycle }) => {
  const [category, setCategory] = useState<CycleCategoryItem | null>(null);
  const [subcategory, setSubcategory] = useState<CycleSubcategoryItem | null>(
    null
  );
  useEffect(() => {
    setCategory(null);
    setSubcategory(null);
  }, [cycle]);

  const {
    data: categoryData,
    error: categoryFetchError,
    isLoading: isCategoryLoading,
  } = useFetchCategoriesFromCycleQuery(cycle);
  const {
    data: subcategoryData,
    error: subcategoryFetchError,
    isLoading: isSubCategoryLoading,
  } = useFetchSubcategoriesFromCycleQuery(cycle);
  const {
    data: contentData,
    error: contentFetchError,
    isLoading: isContentLoading,
  } = useFetchContentsFromCycleQuery(cycle);
  const {
    data: userData,
    error: userFetchError,
    isLoading: isUserLoading,
  } = useFetchCurrentUserQuery(null);

  const handleClickCategory = (item: CycleCategoryItem) => {
    if (item === category) {
      setCategory(null);
      setSubcategory(null);
    } else {
      setCategory(item);
    }
  };
  const handleClickSubcategory = (item: CycleSubcategoryItem) => {
    const setItem = item === subcategory ? null : item;
    setSubcategory(setItem);
  };
  return (
    <>
      <div className="basis-1/4">
        {categoryData && (
          <Category
            categories={categoryData}
            selectedCategory={category}
            handleClickCategory={handleClickCategory}
            user={userData}
          />
        )}
      </div>
      <div className="basis-1/4">
        {category && subcategoryData && (
          <SubCategory
            category={category}
            subcategories={subcategoryData}
            selectedSubcategory={subcategory}
            handleClickSubcategory={handleClickSubcategory}
          />
        )}
      </div>
      <div className="basis-1/4">
        {subcategory && contentData && (
          <Content subcategory={subcategory} contents={contentData} />
        )}
      </div>
    </>
  );
};
