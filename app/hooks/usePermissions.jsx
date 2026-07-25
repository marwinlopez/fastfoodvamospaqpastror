import useGlobal from "./useGlobal";

// Si el staff no tiene `permissions` (sin rol asignado, o cuenta creada
// antes de que existiera este sistema), no se restringe nada — solo se
// filtra cuando el rol trae un arreglo de permisos explícito.
export const hasPermission = (user, permission) => {
  if (!user) return false;
  if (!Array.isArray(user.permissions)) return true;
  return user.permissions.includes(permission);
};

const usePermissions = () => {
  const { user } = useGlobal();
  return {
    can: (permission) => hasPermission(user, permission),
  };
};

export default usePermissions;
