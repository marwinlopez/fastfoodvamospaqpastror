import React, { useContext, useEffect, useState } from 'react'
import apis from '../../api';
import { GlobalContext } from '../context/GlobalContext';

const useCardItem = () => {
  const { ordering, isNewOrder, dispatch } = useContext(GlobalContext);

  const init = async (id) => {
    const { data } = await apis.recipeForId(id);
    const { ingredients }=data.data
    const list = ingredients.map(i=>{
        const { id, description } = i
        return {id, description, disponible: true}
    })
    return list;
  };

  return {
    init,
    isNewOrder
  };
}

export default useCardItem