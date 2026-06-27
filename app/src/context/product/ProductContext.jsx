import React, { createContext } from 'react'

const ProductContext = createContext();

const { Provider, Consumer } = ProductContext;

const STATE_PRODUCT = {
  products: [],
  selected: null,
  newProduct: null,
  isShowModal: false,
  dialog: { component: null, show: false },
  redirect: null,
};

const ProductProvider = ({ children }) => {
  const [state, dispatch] = useReducer(ProductReducer, STATE_PRODUCT);
  const [query, setQuery] = useState([]);
  const [component, setComponent] = useState(null);

  return (
    <Provider
      value={{
        products: query.length > 0 ? query : state.products,
        product: state.newProduct,
        dialog: state.dialog,
        component,
        setComponent,
        dispatch,
      }}
    >
      {children}
    </Provider>
  );
};

export { ProductProvider, Consumer as ProductConsumer, ProductContext };