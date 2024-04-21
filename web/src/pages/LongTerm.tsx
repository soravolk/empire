import { useState } from "react";
import {
  useFetchLongTermsQuery,
  useFetchCyclesOfLongTermQuery,
  useFetchCategoriesFromCycleQuery,
  useFetchSubcategoriesFromCycleQuery,
  useFetchContentsFromCycleQuery,
} from "../store";
import Dropdown from "../components/Dropdown";
import { getLongTermHistoryOptions } from "../utils/utils";
import {
  LongTermItem,
  CycleItem,
  CategoryItem,
  SubcategoryItem,
} from "../types";
import Cycle from "../components/Cycle";
import Category from "../components/Category";
import SubCategory from "../components/Subcategory";
import Content from "../components/Content";

export default function LongTerm() {
  const [cycle, setCycle] = useState<CycleItem | null>(null);
  const [longTerm, setLongTerm] = useState<LongTermItem | null>(null);
  const [category, setCategory] = useState<CategoryItem | null>(null);
  const [subcategory, setSubcategory] = useState<SubcategoryItem | null>(null);
  const { data, error, isLoading } = useFetchLongTermsQuery(null);
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

  return (
    <div className="flex flex-col p-4">
      <div className="w-full mb-4">
        {data && (
          <Dropdown
            options={getLongTermHistoryOptions(data)}
            onSelect={setLongTerm}
          />
        )}
      </div>
      <div className="flex">
        {cycleData && <Cycle cycles={cycleData} setCycle={setCycle} />}
        {categoryData && (
          <Category categories={categoryData} setCategory={setCategory} />
        )}
        {subcategoryData && (
          <SubCategory
            category={category}
            subcategories={subcategoryData}
            setSubcategory={setSubcategory}
          />
        )}
        {contentData && (
          <Content subcategory={subcategory} contents={contentData} />
        )}
      </div>
    </div>
  );
}
