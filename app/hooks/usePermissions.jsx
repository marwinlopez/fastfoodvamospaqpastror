import useGlobal from "./useGlobal";

// Si el staff no tiene `permissions` (sin rol asignado, o cuenta creada
// antes de que existiera este sistema), no se restringe nada — solo se
// filtra cuando el rol trae un arreglo de permisos explícito. El valor
// "all" es el comodín usado por la cuenta admin de bootstrap sembrada
// directamente en la base de datos (roleId "role-admin"), que no lista
// cada permiso individualmente.
export const hasPermission = (user, permission) => {
  if (!user) return false;
  if (!Array.isArray(user.permissions)) return true;
  if (user.permissions.includes("all")) return true;
  return user.permissions.includes(permission);
};

const usePermissions = () => {
  const { user } = useGlobal();
  return {
    can: (permission) => hasPermission(user, permission),
  };
};

export default usePermissions;
