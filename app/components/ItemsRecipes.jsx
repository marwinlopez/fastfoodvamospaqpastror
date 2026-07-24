import React, { useState, memo, useMemo } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import useTheme from "../hooks/useTheme";
import useGlobal from "../hooks/useGlobal";

const ItemsRecipes = ({ recipes, edit, deleteItem, isSelectionMode, onRefresh }) => {
  const [refreshing] = useState(false);
  const theme = useTheme();
  const { company } = useGlobal();
  const money = company?.currencySymbol || "$";
  const styles = useMemo(() => makeStyles(theme), [theme]);

  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={styles.listContent}
      keyExtractor={(recipe) => recipe.recipeId.toString()}
      data={recipes}
      ListEmptyComponent={() => (
        <View style={styles.emptyContainer}>
          <Feather name="folder-minus" size={40} color={theme.textSecondary} />
          <Text style={styles.emptyText}>No existen registros</Text>
        </View>
      )}
      renderItem={({ item }) => {
        const CardContent = (
          <View style={styles.card}>
            <View style={styles.cardLeft}>
              <View style={styles.iconWrapper}>
                <Feather name="book-open" size={20} color={theme.brand} />
              </View>
              <View style={styles.textContent}>
                <Text style={styles.recipeName}>{item.name}</Text>
                <View style={styles.costBadge}>
                  <Text style={styles.costText}>
                    Costo: {money}{" "}
                    {item.cost !== undefined ? Number(item.cost).toFixed(2) : "0.00"}
                  </Text>
                </View>
              </View>
            </View>
            <View style={[styles.cardRight, { flexDirection: "row", alignItems: "center" }]}>
              {isSelectionMode ? (
                <Feather name="plus-circle" size={24} color={theme.brand} style={{ padding: 8 }} />
              ) : (
                <>
                  <TouchableOpacity onPress={() => edit("RecipeScreen", "editRecipe", item)} style={{ padding: 8 }}>
                    <Feather name="edit-2" size={18} color={theme.textSecondary} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => deleteItem(item)} style={{ padding: 8 }}>
                    <Feather name="trash-2" size={18} color={theme.danger} />
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
          colors={[theme.brand]}
        />
      }
      showsVerticalScrollIndicator={false}
    />
  );
};

const makeStyles = (t) => StyleSheet.create({
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
    backgroundColor: t.surface,
    borderRadius: 24,
    marginTop: 20,
    shadowColor: t.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: t.shadowOpacity,
    shadowRadius: 8,
    elevation: 1,
  },
  emptyText: {
    fontSize: 14,
    color: t.textSecondary,
    marginTop: 12,
    fontWeight: "600",
  },
  card: {
    backgroundColor: t.surface,
    borderRadius: 20,
    padding: 16,
    marginVertical: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: t.shadowColor,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: t.shadowOpacity,
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
    backgroundColor: t.brand + "1A", // Fondo suave de marca
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
    color: t.textPrimary,
    marginBottom: 6,
  },
  costBadge: {
    alignSelf: "flex-start",
    backgroundColor: t.success + "1F",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  costText: {
    fontSize: 11,
    fontWeight: "700",
    color: t.success,
  },
  cardRight: {
    justifyContent: "center",
    alignItems: "center",
    width: 40,
    height: 40,
  },
});

export default memo(ItemsRecipes);
