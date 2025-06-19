
import { AllAccountUserTable } from "./AllAccountUserTable";
import { AdminUserTable } from "./AdminUserTable";
import { AdminAddUserForm } from "./AdminAddUserForm";
import { useAdminUsers } from "./useAdminUsers";

export const AdminUsersTab = () => {
  const { 
    users, 
    adminUsers, 
    isLoading, 
    deleteUser, 
    deleteAdminUser, 
    addAdminUser, 
    refreshUsers, 
    refreshAdminUsers 
  } = useAdminUsers();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AllAccountUserTable 
        accountUsers={users} 
        onDelete={deleteUser} 
        onRefresh={refreshUsers}
      />
      <AdminUserTable 
        adminUsers={adminUsers} 
        onDelete={deleteAdminUser} 
      />
      <AdminAddUserForm 
        onAdd={addAdminUser}
        onRefresh={refreshAdminUsers}
      />
    </div>
  );
};
