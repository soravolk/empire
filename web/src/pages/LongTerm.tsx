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
  const [cycle, setCycle] = useState<CycleItem | null>(null);
  const [longTerm, setLongTerm] = useState<LongTermItem | null>(null);
  const [category, setCategory] = useState<CycleCategoryItem | null>(null);
  const [subcategory, setSubcategory] = useState<CycleSubcategoryItem | null>(
    null
  );
  const {
    data: longTermData,
    error: longTermError,
    isLoading: isLongTermLoading,
  } = useFetchLongTermsQuery(null);
  const {
    data: cycleData,
    error: cycleFetchError,
    isLoading: isCycleLoading,
  } = useFetchCyclesOfLongTermQuery(longTerm);
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

  useEffect(() => {
    setCategory(null);
    setSubcategory(null);
  }, [cycle]);

  return (
    <CycleContext.Provider value={cycle}>
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
          <div className="basis-1/4">
            {cycleData && <Cycle cycles={cycleData} setCycle={setCycle} />}
          </div>
          <div className="basis-1/4">
            {cycle && categoryData && (
              <Category
                categories={categoryData}
                setCategory={setCategory}
                user={userData}
              />
            )}
          </div>
          <div className="basis-1/4">
            {cycle && category && subcategoryData && (
              <SubCategory
                category={category}
                subcategories={subcategoryData}
                setSubcategory={setSubcategory}
              />
            )}
          </div>
          <div className="basis-1/4">
            {cycle && subcategory && contentData && (
              <Content subcategory={subcategory} contents={contentData} />
            )}
          </div>
        </div>
      </div>
    </CycleContext.Provider>
  );
}
