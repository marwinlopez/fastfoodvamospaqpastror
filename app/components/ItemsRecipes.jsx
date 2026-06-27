import React, { useState } from "react";
import { memo } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import LinkItemList from "./LinkItemList";
import { COLORS } from "../constants/themes";

const ItemsRecipes = ({ recipes, edit, onRefresh }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  // if (recipes.length === 0) {
  //   return (
  //     <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
  //       <Text>Sin Registro</Text>
  //     </View>
  //   );
  // }
  return (
    <>
      {refreshing ? <ActivityIndicator /> : null}
      <FlatList
        style={{ flex: 1 }}
        keyExtractor={(recipe) => recipe.recipeId}
        data={recipes}
        ListEmptyComponent={() => (
          <TouchableOpacity
            style={{
              flex: 1,
              height: 50,
              backgroundColor: "#000100",
              justifyContent: "center",
            }}
          >
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text>No existen registro!!</Text>
            </View>
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => (
          <View style={{ height: 1, backgroundColor: COLORS.default }} />
        )}
        renderItem={({ item }) => (
          <TouchableOpacity key={item.recipeId}>
            <LinkItemList
              id={item.recipeId}
              name={item.name}
              cost={item.cost}
              coin={item.coin}
              url={"Recipe"}
            />
          </TouchableOpacity>
        )}
        numColumns={1}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </>
  );
};

export default memo(ItemsRecipes);
