// frontend/src/components/admin/users-list.tsx
import { useState, useEffect, useCallback, useRef } from "react";
import { Search, Filter, Download, UserPlus, Eye, Edit, Ban, CheckCircle, XCircle, Loader2, AlertCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { userServices } from "@/services/userServices";
import { toast } from "react-toastify";
import { AdminPagination } from "./admin-pagination";
import { capitalize, getInitials } from "@/utils/namingConventions";
import { Modal } from "../ui/modal";
import { ViewUserModal } from "./view-user-modal";
import { UserManageForm } from "./user-manage-form";
import { formatDate2 } from "@/utils/dateAndTimeFormats";
import type { UserState, UserUpsertResult } from "@/types/user.types";
import { HostManageForm } from "./host-manage-form";
import { getApiErrorMessage, isUnauthorizedError } from "@/utils/getApiErrorMessage";
import { ConfirmationModal } from "./confirmation-modal";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingSpinner1 } from "../common/LoadingSpinner1";




interface ApiResponse {
  usersData: UserState[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function UsersList() {
  // Filters & UI state
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  // Data state
  const [users, setUsers] = useState<UserState[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [viewUser, setViewUser] = useState<UserState | null>(null);
  const [editUser, setEditUser] = useState<UserState | null>(null);
  const [blockUser, setBlockUser] = useState<UserState | null>(null);
  const [deleteUser, setDeleteUser] = useState<UserState | null>(null);

  const [blockingUserId, setBlockingUserId] = useState<string | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [convertToHostUser, setConvertToHostUser] = useState<UserState | null>(null);
  const [isUserFormSubmitting, setIsUserFormSubmitting] = useState(false);



  const { user: currentAdmin }: { user: UserState | null } = useAuth();

  const itemsPerPage = 10;

  // Debounced search
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch users from backend
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        ...(debouncedSearchTerm && { search: debouncedSearchTerm }),
        ...(roleFilter !== "all" && { role: roleFilter }),
        ...(statusFilter !== "all" && { status: statusFilter }),
      });

      const response = await userServices.getAllUsers(params.toString());
      console.log('response in fetchUsers: ', response);

      const data: ApiResponse = response.data || response;

      setUsers(response.usersData);
      setTotalUsers(response.pagination.total);
      setTotalPages(response.pagination.totalPages || Math.ceil(response.pagination.total / itemsPerPage));

    } catch (err: unknown) {
      console.error("Failed to fetch users:", err);

      if (!isUnauthorizedError(err)) {
        const errorMessage = getApiErrorMessage(err);
        if (errorMessage) toast.error(errorMessage);
        setError(errorMessage);
      }

    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearchTerm, roleFilter, statusFilter]);

  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    fetchUsers();
  }, [currentPage, debouncedSearchTerm, roleFilter, statusFilter]);

  // Reset selection when page/filter changes
  useEffect(() => {
    setSelectedUsers([]);
  }, [currentPage, debouncedSearchTerm, roleFilter, statusFilter]);

  // Handle modal success (create/update)
  const handleFormSuccess = (updatedUser?: UserUpsertResult) => {
    setIsCreateModalOpen(false);
    setEditUser(null);

    if (updatedUser && updatedUser.userId) {
      setUsers(prev => prev.map(usr => usr.userId === updatedUser.userId ? { ...usr, ...updatedUser } : usr));
    }

    fetchUsers();
  };

  const handleToggleBlockUser = async (handlingUser: UserState) => {
    try {
      setBlockingUserId(handlingUser.userId);

      const response = await userServices.toggleUserBlock(handlingUser.userId);
      toast.success(response.message);

      setUsers(prev =>
        prev.map(u =>
          u.userId === handlingUser.userId
            ? { ...u, status: response.updatedStatus }
            : u
        )
      );

    } catch (error: unknown) {
      console.log('error in handleToggleBlockUser:', error)
      const errorMessage = getApiErrorMessage(error);
      if (errorMessage) toast.error(errorMessage);

    } finally {
      setBlockingUserId(null);
      setBlockUser(null);
    }
  };


  const handleDeleteUser = async (deleteUser: UserState) => {
    try {
      setDeletingUserId(deleteUser.userId);

      const response = await userServices.deleteUser(deleteUser.userId);
      toast.success(response.message);

      setUsers(prev => prev.filter(user => user.userId !== deleteUser.userId));

    } catch (error: unknown) {
      console.log('error in deleteUser:', error)
      const errorMessage = getApiErrorMessage(error);
      if (errorMessage) toast.error(errorMessage);

    } finally {
      setDeletingUserId(null);
      setDeleteUser(null);
    }
  };

  const getStatusBadgeVariant = (status: string): "default" | "success" | "destructive" | "secondary" | "outline" => {
    switch (status) {
      case "active": return "success";
      case "blocked": return "destructive";
      case "pending": return "outline";
      default: return "secondary";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active": return <CheckCircle className="h-3.5 w-3.5" />;
      case "blocked": return <XCircle className="h-3.5 w-3.5" />;
      case "pending": return <Filter className="h-3.5 w-3.5" />;
      default: return null;
    }
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const toggleAllUsers = () => {
    setSelectedUsers(prev =>
      prev.length === users.length && users.length > 0
        ? []
        : users.map(user => user.userId)
    );
  };

  const roleVariant = {
    admin: "brand" as const,
    host: "primary" as const,
    user: "neutral" as const,
  };

  return (
    <Card className="shadow-(--shadow-sm) border border-(--border-default) rounded-2xl overflow-hidden">
      <CardHeader className="bg-(--card-bg) border-b border-(--border-default)">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="text-2xl font-bold text-(--heading-primary)">
              Users
            </CardTitle>
            <p className="text-sm text-(--text-secondary) mt-1">
              Manage all platform users ({totalUsers} total)
            </p>
          </div>
          <Button 
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-(--brand-primary) hover:bg-(--brand-primary-hover) text-white font-medium rounded-xl shadow-md transition-all">
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-6 bg-(--card-bg)">
        {/* Search & Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-(--text-tertiary)" />
            <Input
              placeholder="Search by name, email, mobile..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 h-11 border-(--border-muted) rounded-xl focus-visible:ring-2 focus-visible:ring-(--brand-primary-light) text-(--text-primary) placeholder:text-(--text-tertiary)"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <Select value={roleFilter} onValueChange={(v) => { setRoleFilter(v); setCurrentPage(1); }}>
              <SelectTrigger className="w-40 h-11 rounded-xl border-(--border-muted)">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="host">Host</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}>
              <SelectTrigger className="w-40 h-11 rounded-xl border-(--border-muted)">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="blocked">Blocked</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>

            {selectedUsers.length > 0 && (
              <Button variant="outline" className="h-11 rounded-xl border-(--border-strong) hover:bg-(--bg-secondary)">
                <Download className="h-4 w-4 mr-2" />
                Export CSV ({selectedUsers.length})
              </Button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="relative">
          {isUserFormSubmitting && (
            <div className="absolute inset-0 z-50 !m-0 !p-0 flex items-center justify-center bg-(--bg-overlay) backdrop-blur-[0.2px]">
              <LoadingSpinner1 
                size="lg"
                message='Processing...'
                // subMessage={loadingSubMessage}
                subMessage=''
              />
            </div>
          )}
          <div className="rounded-xl border border-(--border-default) overflow-hidden bg-(--card-bg)">
            <Table>
              <TableHeader>
                <TableRow className="bg-(--bg-tertiary) hover:bg-(--bg-tertiary)">
                  <TableHead className="w-12 h-12">
                    <Checkbox
                      checked={users.length > 0 && selectedUsers.length === users.length}
                      onCheckedChange={toggleAllUsers}
                      disabled={loading}
                    />
                  </TableHead>
                  <TableHead className="text-(--text-secondary) font-semibold">Sl No</TableHead>
                  <TableHead className="text-(--text-secondary) font-semibold">User</TableHead>
                  <TableHead className="text-(--text-secondary) font-semibold">Email</TableHead>
                  <TableHead className="text-(--text-secondary) font-semibold">Phone</TableHead>
                  <TableHead className="text-(--text-secondary) font-semibold">Role</TableHead>
                  <TableHead className="text-(--text-secondary) font-semibold">Status</TableHead>
                  <TableHead className="text-(--text-secondary) font-semibold">Joined</TableHead>
                  <TableHead className="text-right text-(--text-secondary) font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-32 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Loading users...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-32 text-center text-red-500">
                      {error}
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow key='empty'>
                    <TableCell colSpan={9} className="h-32 text-center text-(--text-secondary)">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user, index) => (
                    <TableRow key={user.userId}>
                      <TableCell className="h-14">
                        <Checkbox
                          checked={selectedUsers.includes(user.userId)}
                          onCheckedChange={() => toggleUserSelection(user.userId)}
                        />
                      </TableCell>
                      <TableCell className="font-medium text-(--text-primary)">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 ring-2 ring-offset-2 ring-(--text-tertiary) ring-offset-(--text-inverse)">
                            <AvatarImage src={user.profilePic} alt={user.name} />
                            <AvatarFallback className="bg-(--brand-primary-light)/20 text-(--brand-primary) font-medium text-sm">
                              {getInitials(user.name ?? "")}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-(--text-primary) whitespace-nowrap">{user.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-(--text-secondary)">
                        <div className="flex items-center gap-1 leading-none">
                          <span>{user.email}</span>
                          {user.isEmailVerified ? (
                            <CheckCircle size={14} className="text-(--status-success)" />
                          ) : (
                            <AlertCircle size={14} className="text-(--status-error)" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-(--text-secondary)">{user.mobile}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            roleVariant[
                              (user.isSuperAdmin ? "admin" : user.role).toLowerCase() as keyof typeof roleVariant
                            ]
                          }
                          size="sm"
                          className="rounded-lg font-mono whitespace-nowrap inline-flex items-center justify-center"
                        >
                          {user.isSuperAdmin ? "Super Admin" : capitalize(user.role)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={getStatusBadgeVariant(user.status)}
                          size="sm"
                          className="rounded-lg font-mono flex items-center gap-1 w-fit"
                        >
                          {getStatusIcon(user.status)}
                          {capitalize(user.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-(--text-secondary) whitespace-nowrap">{formatDate2(user.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-col items-end gap-2">

                          {/* Row 1: Icon actions */}
                          <div className="flex items-center gap-1">
                            {/* View */}
                            <Button
                              onClick={() => setViewUser(user)}
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 rounded-lg hover:bg-(--btn-neutral)"
                            >
                              <Eye className="h-4 w-4 text-(--text-secondary)" />
                            </Button>

                            {(currentAdmin?.isSuperAdmin || user.role !== "admin") && (
                              <>
                                {/* Edit */}
                                <Button
                                  onClick={() => setEditUser(user)}
                                  variant="ghost"
                                  size="icon"
                                  className="h-9 w-9 rounded-lg hover:bg-(--btn-neutral)"
                                >
                                  <Edit className="h-4 w-4 text-(--text-secondary)" />
                                </Button>

                                {/* Block / Unblock */}
                                { !user.isSuperAdmin && (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className={cn(
                                        "h-9 w-9 rounded-lg hover:bg-(--btn-neutral)",
                                        user.status === "blocked"
                                          ? "text-(--status-success)"
                                          : "text-(--status-error)"
                                      )}
                                      onClick={() => setBlockUser(user)}
                                      disabled={blockingUserId === user.userId}
                                    >
                                      {blockingUserId === user.userId ? (
                                          <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : user.status === "blocked" ? (
                                          <CheckCircle className="h-4 w-4" />
                                        ) : (
                                          <Ban className="h-4 w-4" />
                                        )}
                                    </Button>

                                    {/* Delete */}
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-9 w-9 rounded-lg hover:bg-(--btn-neutral) text-(--status-error)"
                                      onClick={() => setDeleteUser(user)}
                                      disabled={deletingUserId === user.userId}
                                    >
                                      {deletingUserId === user.userId ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <Trash2 className="h-4 w-4" />
                                      )}
                                    </Button>
                                  </>
                                )}
                              </>
                            )}
                          </div>

                          {/* Row 2: Convert to Host */}
                          {/* {(currentAdmin?.isSuperAdmin || user.role !== "admin") && !user.isSuperAdmin && 
                            user.role !== "host" && (
                              <Button
                                variant="primaryOutline"
                                size="sm"
                                className="h-8"
                                onClick={() => setConvertToHostUser(user)}
                              >
                                Convert to Host
                              </Button>
                            )} */}
                        </div>
                      </TableCell>

                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Pagination */}
        {!loading && users.length > 0 && (
          <AdminPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalUsers}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        )}

        {/* Create User Modal */}
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Create New User"
          size="lg">
          <UserManageForm
            onSubmitting={setIsUserFormSubmitting}
            onSuccess={handleFormSuccess}
            onCancel={() => setIsCreateModalOpen(false)}
          />
        </Modal>

        {/* View User Modal */}
        <Modal
          isOpen={!!viewUser}
          onClose={() => setViewUser(null)}
          title="User Profile"
          size="md">
          {viewUser && <ViewUserModal user={viewUser} />}
        </Modal>

        {/* Edit User Modal */}
        <Modal
          isOpen={!!editUser}
          onClose={() => setEditUser(null)}
          title="Edit User"
          size="lg">
          {editUser && (
            <UserManageForm
              user={editUser}
              onSubmitting={setIsUserFormSubmitting}
              onSuccess={handleFormSuccess}
              onCancel={() => setEditUser(null)}
            />
          )}
        </Modal>

        {/* Block / Unblock User Confirmation Modal */}
        <ConfirmationModal
          isOpen={!!blockUser}
          onClose={() => setBlockUser(null)}
          onConfirm={() => handleToggleBlockUser(blockUser!)}
          title={blockUser?.status === "blocked" ? "Unblock User" : "Block User"}
          description={blockUser?.status === "blocked" ? "Are you sure you want to unblock this user?" : "Are you sure you want to block this user?"}
          confirmText={
            blockingUserId === blockUser?.userId
              ? "Processing..."
              : blockUser?.status === "blocked" ? "Unblock" : "Block"
          }
          variant="danger"
          loading={blockingUserId === blockUser?.userId}
        />

        {/* Delete User Confirmation Modal */}
        <ConfirmationModal
          isOpen={!!deleteUser}
          onClose={() => setDeleteUser(null)}
          onConfirm={() => handleDeleteUser(deleteUser!)}
          title="Delete User"
          description="This action cannot be undone. The user will be permanently removed."
          confirmText={deletingUserId === deleteUser?.userId ? "Deleting..." : "Delete"}
          variant="danger"
          loading={deletingUserId === deleteUser?.userId}
        />


        {/* Convert to Host Modal */}
        <Modal
          isOpen={!!convertToHostUser}
          onClose={() => setConvertToHostUser(null)}
          title="Convert User to Host"
          size="lg"
        >
          {convertToHostUser && (
            <HostManageForm
              host={convertToHostUser}
              mode="convertMode"
              onSuccess={(updatedUser) => {
                // Refresh both lists if needed
                fetchUsers();
                // Optional: if you have hosts list open in another tab → it will need refresh too
                toast.success("User successfully converted to Host-------!");
                setConvertToHostUser(null);
              }}
              onCancel={() => setConvertToHostUser(null)}
            />
          )}
        </Modal>

      </CardContent>
    </Card>
  );
}