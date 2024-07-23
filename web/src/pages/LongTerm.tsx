import { useState, useEffect } from "react";
import {
  useFetchLongTermsQuery,
  useFetchCyclesOfLongTermQuery,
  useFetchCategoriesFromCycleQuery,
  useFetchSubcategoriesFromCycleQuery,
  useFetchContentsFromCycleQuery,
  useFetchCurrentUserQuery,
} from "../store";
import Dropdown from "../components/Dropdown";
import { getLongTermHistoryOptions } from "../utils/utils";
import {
  LongTermItem,
  CycleItem,
  CycleCategoryItem,
  CycleSubcategoryItem,
} from "../types";
import Cycle from "../components/Cycle";
import Category from "../components/Category";
import SubCategory from "../components/Subcategory";
import Content from "../components/Content";
import CycleContext from "../context/cycle";

export default function LongTerm() {
  const [longTerm, setLongTerm] = useState<LongTermItem | null>(null);
  const {
    data: longTermData,
    error: longTermError,
    isLoading: isLongTermLoading,
  } = useFetchLongTermsQuery(null);

  return (
    <div className="flex flex-col">
      <div className="w-full mb-4">
        {longTermData && (
          <Dropdown
            options={getLongTermHistoryOptions(longTermData)}
            onSelect={setLongTerm}
          />
        )}
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
  const {
    data: cycleData,
    error: cycleFetchError,
    isLoading: isCycleLoading,
  } = useFetchCyclesOfLongTermQuery(longTerm);
  const [cycle, setCycle] = useState<CycleItem | null>(null);

  return (
    <CycleContext.Provider value={cycle}>
      <div className="basis-1/4">
        {cycleData && <Cycle cycles={cycleData} setCycle={setCycle} />}
      </div>
      {cycle && <Items cycle={cycle} />}
    </CycleContext.Provider>
  );
};

const Items: React.FC<ItemProps> = ({ cycle }) => {
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
