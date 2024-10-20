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
  CycleContentItem,
} from "../types";
import Cycle from "../components/Cycle";
import Category from "../components/Category";
import SubCategory from "../components/Subcategory";
import Content from "../components/Content";
import { CycleItemContext, useCycleListContext } from "../context/cycle";
import Detail from "../components/Detail";

export default function LongTerm() {
  const [longTerm, setLongTerm] = useState<LongTermItem | null>(null);
  const {
    data: longTermData,
    error: longTermError,
    isLoading: isLongTermLoading,
  } = useFetchLongTermsQuery(null);

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
  shortTerm?: boolean;
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
        {cycleList && <Cycle cycles={cycleList} setCycle={setCycle} />}
      </div>
      {cycle && <Items cycle={cycle} />}
    </CycleItemContext.Provider>
  );
};

// TODO: consider refactoring and reusability of this component
export const Items: React.FC<ItemProps> = ({ cycle, shortTerm }) => {
  const [category, setCategory] = useState<CycleCategoryItem | null>(null);
  const [subcategory, setSubcategory] = useState<CycleSubcategoryItem | null>(
    null
  );
  const [content, setContent] = useState<CycleContentItem | null>(null);

  useEffect(() => {
    setCategory(null);
    setSubcategory(null);
    setContent(null);
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
      setContent(null);
    } else {
      setCategory(item);
    }
  };
  const handleClickSubcategory = (item: CycleSubcategoryItem) => {
    if (item === subcategory) {
      setSubcategory(null);
      setContent(null);
    } else {
      setSubcategory(item);
    }
  };
  const handleClickContent = (item: CycleContentItem) => {
    const setItem = item === content ? null : item;
    setContent(setItem);
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
          <Content
            subcategory={subcategory}
            contents={contentData}
            handleClickContent={handleClickContent}
          />
        )}
      </div>
      {shortTerm && content && (
        <div className="basis-1/4">
          <Detail content={content} />
        </div>
      )}
    </>
  );
};
