import React from "react";
import apis from "../../api";

const useProductListIndex = () => {
  const init = async () => {
    const { data } = await apis.allProducts();
    return data;
  };


  return {
    init
  };
};

export default useProductListIndex;
