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

const ItemsRecipes = ({ recipes, edit, deleteItem, isSelectionMode, onRefresh, yieldMap = {} }) => {
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
        const recipeId = item.recipeId || item.id;
        const maxProduceable = yieldMap[recipeId];
        const CardContent = (
          <View style={styles.card}>
            <View style={styles.cardLeft}>
              <View style={styles.iconWrapper}>
                <Feather name="book-open" size={20} color={theme.brand} />
              </View>
              <View style={styles.textContent}>
                <Text style={styles.recipeName}>{item.name}</Text>
                <View style={styles.badgeRow}>
                  <View style={styles.costBadge}>
                    <Text style={styles.costText}>
                      Costo: {money}{" "}
                      {item.cost !== undefined ? Number(item.cost).toFixed(2) : "0.00"}
                    </Text>
                  </View>
                  {maxProduceable !== undefined && (
                    <View
                      style={[
                        styles.yieldBadge,
                        { backgroundColor: (maxProduceable > 0 ? theme.brand : theme.danger) + "1F" },
                      ]}
                    >
                      <Feather
                        name="box"
                        size={10}
                        color={maxProduceable > 0 ? theme.brand : theme.danger}
                      />
                      <Text
                        style={[
                          styles.yieldText,
                          { color: maxProduceable > 0 ? theme.brand : theme.danger },
                        ]}
                      >
                        {" "}Produce: {maxProduceable}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
            <View style={[styles.cardRight, { flexDirection: "row", alignItems: "center" }]}>
              {isSelectionMode ? (
                <Feather name="plus-circle" size={24} color={theme.brand} style={{ padding: 8 }} />
              ) : (
                <>
                  <TouchableOpacity
                    onPress={() => edit("RecipeScreen", "editRecipe", item)}
                    style={[styles.actionIconButton, { backgroundColor: theme.inputBg }]}
                  >
                    <Feather name="edit-2" size={16} color={theme.textSecondary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => deleteItem(item)}
                    style={[styles.actionIconButton, styles.actionIconButtonLast, { backgroundColor: theme.danger + "1A" }]}
                  >
                    <Feather name="trash-2" size={16} color={theme.danger} />
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
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  costBadge: {
    alignSelf: "flex-start",
    backgroundColor: t.success + "1F",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginRight: 6,
    marginTop: 4,
  },
  costText: {
    fontSize: 11,
    fontWeight: "700",
    color: t.success,
  },
  yieldBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginTop: 4,
  },
  yieldText: {
    fontSize: 11,
    fontWeight: "700",
  },
  actionIconButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 6,
  },
  actionIconButtonLast: {
    marginLeft: 8,
  },
  cardRight: {
    justifyContent: "center",
    alignItems: "center",
  },
});

export default memo(ItemsRecipes);
