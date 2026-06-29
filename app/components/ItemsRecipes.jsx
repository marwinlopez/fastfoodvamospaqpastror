import React, { useState, memo } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { COLORS } from "../src/constants/themes";

const ItemsRecipes = ({ recipes, edit, deleteItem, isSelectionMode, onRefresh }) => {
  const [refreshing] = useState(false);

  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={styles.listContent}
      keyExtractor={(recipe) => recipe.recipeId.toString()}
      data={recipes}
      ListEmptyComponent={() => (
        <View style={styles.emptyContainer}>
          <Feather name="folder-minus" size={40} color="#8E9AA6" />
          <Text style={styles.emptyText}>No existen registros</Text>
        </View>
      )}
      renderItem={({ item }) => {
        const CardContent = (
          <View style={styles.card}>
            <View style={styles.cardLeft}>
              <View style={styles.iconWrapper}>
                <Feather name="book-open" size={20} color="#5802F1" />
              </View>
              <View style={styles.textContent}>
                <Text style={styles.recipeName}>{item.name}</Text>
                <View style={styles.costBadge}>
                  <Text style={styles.costText}>
                    Costo: {item.coin || "USD"}{" "}
                    {item.cost !== undefined ? Number(item.cost).toFixed(2) : "0.00"}
                  </Text>
                </View>
              </View>
            </View>
            <View style={[styles.cardRight, { flexDirection: "row", alignItems: "center" }]}>
              {isSelectionMode ? (
                <Feather name="plus-circle" size={24} color="#5802F1" style={{ padding: 8 }} />
              ) : (
                <>
                  <TouchableOpacity onPress={() => edit("RecipeScreen", "editRecipe", item)} style={{ padding: 8 }}>
                    <Feather name="edit-2" size={18} color="#8E9AA6" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => deleteItem(item)} style={{ padding: 8 }}>
                    <Feather name="trash-2" size={18} color="#FF3B30" />
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        );

        if (isSelectionMode) {
          return (
            <TouchableOpacity onPress={() => edit("RecipeScreen", "editRecipe", item)} activeOpacity={0.7}>
              {CardContent}
            </TouchableOpacity>
          );
        }
        return CardContent;
      }}
      numColumns={1}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[COLORS.default]}
        />
      }
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 24,
    paddingHorizontal: 2,
  },
  emptyContainer: {
    flex: 1,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
  },
  emptyText: {
    fontSize: 14,
    color: "#8E9AA6",
    marginTop: 12,
    fontWeight: "600",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    marginVertical: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    // Sombras premium sutiles (Efecto Canvas)
    shadowColor: "#1A1D20",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 2,
  },
  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#5802F110", // Fondo suave púrpura
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  textContent: {
    flex: 1,
  },
  recipeName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1D20", // Texto oscuro carbón
    marginBottom: 6,
  },
  costBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#E6F4EA", // Badge verde pastel
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  costText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#137333", // Verde oscuro legible
  },
  cardRight: {
    justifyContent: "center",
    alignItems: "center",
    width: 40,
    height: 40,
  },
});

export default memo(ItemsRecipes);
