// frontend/src/components/admin/users-list.tsx
import { useState, useEffect, useCallback, useRef } from "react";
import { Search, Filter, Download, UserPlus, Eye, Edit, Ban, CheckCircle, XCircle, Loader2 } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { userServices } from "@/services/userServices";
import { toast } from "react-toastify";
import { AdminPagination } from "./admin-pagination";


interface User {  //  import from types / dto
  userId: string;
  name: string;
  email: string;
  phone: string;
  role: "Admin" | "Host" | "User";
  status: "Active" | "Blocked" | "Pending";
  joinDate: string;
  avatar?: string;
}


interface ApiResponse {
  userData: User[];
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
  const [users, setUsers] = useState<User[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const itemsPerPage = 1;

  // Debounced search
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1); // Reset to first page on search
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

      // Adjust based on your actual API response structure
      const data: ApiResponse = response.data || response;

      setUsers(response.usersData);
      setTotalUsers(response.pagination.total);
      setTotalPages(response.pagination.totalPages || Math.ceil(response.pagination.total / itemsPerPage));

    } catch (err: any) {
      console.error("Failed to fetch users:", err);
      const errorMessage = err.response?.data?.message || err.response?.data?.error+'----' || "Something went wrong. Please try again in a moment.";

      if (err.status != 401){
        setError(errorMessage);
        toast.error(errorMessage);
      }

    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearchTerm, roleFilter, statusFilter]);



  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return; // Skip the first run (the duplicate from Strict Mode)
    }

    fetchUsers();
  }, [currentPage, debouncedSearchTerm, roleFilter, statusFilter]);


  // Reset selection when page/filter changes
  useEffect(() => {
    setSelectedUsers([]);
  }, [currentPage, debouncedSearchTerm, roleFilter, statusFilter]);

  const getStatusBadgeVariant = (status: string): "default" | "success" | "destructive" | "secondary" | "outline" => {
    switch (status) {
      case "Active": return "success";
      case "Blocked": return "destructive";
      case "Pending": return "outline";
      default: return "secondary";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Active": return <CheckCircle className="h-3.5 w-3.5" />;
      case "Blocked": return <XCircle className="h-3.5 w-3.5" />;
      case "Pending": return <Filter className="h-3.5 w-3.5" />;
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
    Admin: "brand" as const,
    Host: "primary" as const,
    User: "neutral" as const,
  };

  return (
    <Card className="shadow-[var(--shadow-lg)] border border-[var(--border-default)] rounded-2xl overflow-hidden">
      <CardHeader className="bg-[var(--card-bg)] border-b border-[var(--border-default)]">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="text-2xl font-bold text-[var(--heading-primary)]">
              Users
            </CardTitle>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              Manage all platform users ({totalUsers} total)
            </p>
          </div>
          <Button className="bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white font-medium rounded-xl shadow-md transition-all">
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-6 bg-[var(--card-bg)]">
        {/* Search & Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-tertiary)]" />
            <Input
              placeholder="Search by name, email, phone, user ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 h-11 border-[var(--border-muted)] rounded-xl focus-visible:ring-2 focus-visible:ring-[var(--brand-primary-light)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <Select value={roleFilter} onValueChange={(v) => { setRoleFilter(v); setCurrentPage(1); }}>
              <SelectTrigger className="w-40 h-11 rounded-xl border-[var(--border-muted)]">
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
              <SelectTrigger className="w-40 h-11 rounded-xl border-[var(--border-muted)]">
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
              <Button variant="outline" className="h-11 rounded-xl border-[var(--border-strong)] hover:bg-[var(--bg-secondary)]">
                <Download className="h-4 w-4 mr-2" />
                Export CSV ({selectedUsers.length})
              </Button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-[var(--border-default)] overflow-hidden bg-[var(--card-bg)]">
          <Table>
            <TableHeader>
              <TableRow className="bg-[var(--bg-tertiary)] hover:bg-[var(--bg-tertiary)]">
                <TableHead className="w-12 h-12">
                  <Checkbox
                    checked={users.length > 0 && selectedUsers.length === users.length}
                    onCheckedChange={toggleAllUsers}
                    disabled={loading}
                  />
                </TableHead>
                <TableHead className="text-[var(--text-secondary)] font-semibold">Sl No</TableHead>
                <TableHead className="text-[var(--text-secondary)] font-semibold">User</TableHead>
                <TableHead className="text-[var(--text-secondary)] font-semibold">Email</TableHead>
                <TableHead className="text-[var(--text-secondary)] font-semibold">Phone</TableHead>
                <TableHead className="text-[var(--text-secondary)] font-semibold">Role</TableHead>
                <TableHead className="text-[var(--text-secondary)] font-semibold">Status</TableHead>
                <TableHead className="text-[var(--text-secondary)] font-semibold">Joined</TableHead>
                <TableHead className="text-right text-[var(--text-secondary)] font-semibold">Actions</TableHead>
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
                  <TableCell colSpan={9} className="h-32 text-center text-[var(--text-secondary)]">
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
                    <TableCell className="font-medium text-[var(--text-primary)]">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 ring-2 ring-offset-0 ring-[var(--bg-primary)]">
                          <AvatarImage src={user.avatar} alt={user.name} />
                          <AvatarFallback className="bg-[var(--brand-primary-light)]/20 text-[var(--brand-primary)] font-medium text-sm">
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-[var(--text-primary)]">{user.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-[var(--text-secondary)]">{user.email}</TableCell>
                    <TableCell className="text-[var(--text-secondary)]">{user.phone}</TableCell>
                    <TableCell>
                      <Badge variant={roleVariant[user.role]} className="rounded-lg font-medium">
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={getStatusBadgeVariant(user.status)}
                        className="rounded-lg font-medium flex items-center gap-1.5 w-fit"
                      >
                        {getStatusIcon(user.status)}
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-[var(--text-secondary)] text-sm">{user.joinDate}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-[var(--bg-secondary)]">
                          <Eye className="h-4 w-4 text-[var(--text-secondary)]" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-[var(--bg-secondary)]">
                          <Edit className="h-4 w-4 text-[var(--text-secondary)]" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-[var(--status-error-bg)] text-[var(--status-error)]">
                          <Ban className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
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
      </CardContent>
    </Card>
  );
}