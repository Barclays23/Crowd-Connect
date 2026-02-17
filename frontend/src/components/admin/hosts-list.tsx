// frontend/src/components/admin/hosts-list.tsx
import { useState, useEffect, useCallback, useRef } from "react";
import {
  Search,
  Download,
  Eye,
  Edit,
  Ban,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
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
import { toast } from "react-toastify";
import { AdminPagination } from "./admin-pagination";
import { capitalize, getInitials } from "@/utils/namingConventions";
import { Modal } from "../ui/modal";
import { formatDate2 } from "@/utils/dateAndTimeFormats";

import { hostServices } from "@/services/hostServices";
import { HostManageForm } from "./host-manage-form";
import { ViewHostModal } from "./view-host-modal";
import type { HostStatus, UserState } from "@/types/user.types";
import { getApiErrorMessage } from "@/utils/errorMessages.utils";
import { RejectHostModal } from "./reject-host-modal";
import { ConfirmationModal } from "./confirmation-modal";



interface ApiResponse {
  hostsData: UserState[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}


export function HostsList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [hostStatusFilter, setHostStatusFilter] = useState("all");
  const [accountStatusFilter, setAccountStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedHosts, setSelectedHosts] = useState<string[]>([]);

  const [hosts, setHosts] = useState<UserState[]>([]);
  const [totalHosts, setTotalHosts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [viewHost, setViewHost] = useState<UserState | null>(null);
  const [editHost, setEditHost] = useState<UserState | null>(null);
  const [approveHostId, setApproveHostId] = useState<string | null>(null);
  const [rejectHostId, setRejectHostId] = useState<string | null>(null);


  const itemsPerPage = 10;
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchHosts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        role: "host",
        ...(debouncedSearchTerm && { search: debouncedSearchTerm }),
        ...(hostStatusFilter !== "all" && { hostStatus: hostStatusFilter }),
        ...(accountStatusFilter !== "all" && { status: accountStatusFilter }),
      });
      
      console.log("Fetching hosts with params:", params.toString());

      const response = await hostServices.getAllHosts(params.toString());
      console.log("Response in fetchHosts :", response);

      const data: ApiResponse = response.data || response;

      setHosts(data.hostsData);
      setTotalHosts(data.pagination.total);
      setTotalPages(data.pagination.totalPages || Math.ceil(data.pagination.total / itemsPerPage));

    } catch (err: unknown) {
      console.error("Failed to fetch hosts:", err);
      const errorMessage = getApiErrorMessage(err);
      if (errorMessage) toast.error(errorMessage);
      setError(errorMessage);

    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearchTerm, hostStatusFilter, accountStatusFilter]);


  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    fetchHosts();
  }, [fetchHosts]);


  // Reset selection when filters/page change
  useEffect(() => {
    setSelectedHosts([]);
  }, [currentPage, debouncedSearchTerm, hostStatusFilter, accountStatusFilter]);


  const handleFormSuccess = () => {
    // setIsCreateModalOpen(false);
    setEditHost(null);
    fetchHosts();
  };


  // Approve / Reject host application
  const handleHostApplication = async (hostId: string, action: "approve" | "reject", reason?: string) => {
    if (action === "reject" && !reason?.trim()) {
      toast.error("Rejection reason is required");
      return;
    }

    try {
      const response = await hostServices.manageHostRequest({hostId, action, reason});

      toast.success(response.message || `Host ${action === "approve" ? "approved" : "rejected"} successfully`);

      // Optimistic update
      setHosts((prev) =>
        prev.map((hst) =>
          hst.userId === hostId
            ? {
                ...hst,
                hostStatus: action === "approve" ? "approved" : "rejected",
              }
            : hst
        )
      );

      fetchHosts(); // refresh anyway
      
    } catch (err: unknown) {
      const errorMessage = getApiErrorMessage(err);
      if (errorMessage) toast.error(errorMessage);
    }
  };


  const getHostStatusBadgeVariant = (status?: HostStatus) => {
    switch (status) {
      case "approved":
        return "success";
      case "rejected":
        return "destructive";
      case "pending":
        return "outline";
      default:
        return "secondary";
    }
  };


  const getHostStatusIcon = (status?: HostStatus) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-3.5 w-3.5" />;
      case "rejected":
        return <XCircle className="h-3.5 w-3.5" />;
      case "pending":
        return <AlertCircle className="h-3.5 w-3.5" />;
      default:
        return null;
    }
  };


  const toggleHostSelection = (hostId: string) => {
    setSelectedHosts((prev) =>
      prev.includes(hostId) ? prev.filter((id) => id !== hostId) : [...prev, hostId]
    );
  };


  const toggleAll = () => {
    setSelectedHosts((prev) =>
      prev.length === hosts.length && hosts.length > 0 ? [] : hosts.map((h) => h.userId)
    );
  };




  return (
    <Card className="shadow-(--shadow-sm) border border-(--border-default) rounded-2xl overflow-hidden">
      <CardHeader className="bg-(--card-bg) border-b border-(--border-default)">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="text-2xl font-bold text-(--heading-primary)">Hosts</CardTitle>
            <p className="text-sm text-(--text-secondary) mt-1">
              Manage all platform hosts ({totalHosts} total)
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 bg-(--card-bg)">
        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-(--text-tertiary)" />
            <Input
              placeholder="Search by name, email, organization..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 h-11 border-(--border-muted) rounded-xl focus-visible:ring-2 focus-visible:ring-(--brand-primary-light)"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <Select value={hostStatusFilter} onValueChange={(v) => { setHostStatusFilter(v); setCurrentPage(1); }}>
              <SelectTrigger className="w-44 h-11 rounded-xl border-(--border-muted)">
                <SelectValue placeholder="Host Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Host Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Select value={accountStatusFilter} onValueChange={(v) => { setAccountStatusFilter(v); setCurrentPage(1); }}>
              <SelectTrigger className="w-44 h-11 rounded-xl border-(--border-muted)">
                <SelectValue placeholder="Account Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Accounts</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="blocked">Blocked</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>

            {selectedHosts.length > 0 && (
              <Button variant="outline" className="h-11 rounded-xl">
                <Download className="h-4 w-4 mr-2" />
                Export CSV ({selectedHosts.length})
              </Button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-(--border-default) overflow-hidden bg-(--card-bg)">
          <Table>
            <TableHeader>
              <TableRow className="bg-(--bg-tertiary) hover:bg-(--bg-tertiary)">
                <TableHead className="w-12">
                  <Checkbox
                    checked={hosts.length > 0 && selectedHosts.length === hosts.length}
                    onCheckedChange={toggleAll}
                    disabled={loading}
                  />
                </TableHead>
                <TableHead className="text-(--text-secondary) font-semibold">Sl No</TableHead>
                <TableHead className="text-(--text-secondary) font-semibold">Host</TableHead>
                <TableHead className="text-(--text-secondary) font-semibold">Organization</TableHead>
                <TableHead className="text-(--text-secondary) font-semibold">Email</TableHead>
                <TableHead className="text-(--text-secondary) font-semibold">Phone</TableHead>
                <TableHead className="text-(--text-secondary) font-semibold">Account Status</TableHead>
                <TableHead className="text-(--text-secondary) font-semibold">Host Status</TableHead>
                <TableHead className="text-(--text-secondary) font-semibold">Applied Date</TableHead>
                <TableHead className="text-right text-(--text-secondary) font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={10} className="h-32 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Loading hosts...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={10} className="h-32 text-center text-(--status-error)">
                    {error}
                  </TableCell>
                </TableRow>
              ) : hosts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="h-32 text-center">
                    No hosts found
                  </TableCell>
                </TableRow>
              ) : (
                hosts.map((host, index) => (
                  <TableRow key={host.userId}>
                    <TableCell>
                      <Checkbox
                        checked={selectedHosts.includes(host.userId)}
                        onCheckedChange={() => toggleHostSelection(host.userId)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={host.profilePic} alt={host.name} />
                          <AvatarFallback className="bg-(--brand-primary-light)/20 text-(--brand-primary)">
                            {getInitials(host.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{host.name}</span>
                      </div>
                    </TableCell>

                    <TableCell className="text-(--text-secondary)">
                      {host.organizationName || "—"}
                    </TableCell>

                    <TableCell className="text-(--text-secondary)">
                      <div className="flex items-center gap-1">
                        <span>{host.email}</span>
                        {host.isEmailVerified ? (
                          <CheckCircle size={14} className="text-(--status-success)" />
                        ) : (
                          <AlertCircle size={14} className="text-(--status-error)" />
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="text-(--text-secondary)">{host.mobile || "—"}</TableCell>

                    <TableCell>
                        <Badge variant={host.status === "active" ? "success" : host.status === "blocked" ? "destructive" : "outline"}>
                            {capitalize(host.status)}
                        </Badge>
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={getHostStatusBadgeVariant(host.hostStatus)}
                        className="flex items-center gap-1 w-fit"
                      >
                        {getHostStatusIcon(host.hostStatus)}
                        {host.hostStatus ? capitalize(host.hostStatus) : "—"}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-(--text-secondary) whitespace-nowrap">
                      {host.hostAppliedAt ? formatDate2(host.hostAppliedAt) : "—"}
                    </TableCell>

                    <TableCell className="text-right">
                        <div className="flex flex-col items-end gap-2">
                            {/* Primary actions (Approve / Reject) */}
                            {host.hostStatus === "pending" && (
                            <div className="flex items-center gap-2">
                                <Button
                                    onClick={() => setApproveHostId(host.userId)}
                                    variant="outline"
                                    size="sm"
                                    className="h-8
                                        border-(--badge-success-border)
                                        text-(--badge-success-text)
                                        hover:bg-(--badge-success-bg)"
                                >
                                    <ThumbsUp className="h-3.5 w-3.5 mr-1" />
                                    Approve
                                </Button>

                                <Button
                                    onClick={() => setRejectHostId(host.userId)}
                                    variant="outline"
                                    size="sm"
                                    className="h-8
                                        border-(--badge-error-border)
                                        text-(--badge-error-text)
                                        hover:bg-(--badge-error-bg)"
                                >
                                    <ThumbsDown className="h-3.5 w-3.5 mr-1" />
                                    Reject
                                </Button>
                            </div>
                            )}

                            {/* Secondary icon actions */}
                            <div className="flex items-center gap-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setViewHost(host)}
                                className="h-9 w-9"
                            >
                                <Eye className="h-4 w-4 text-(--text-secondary)" />
                            </Button>

                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setEditHost(host)}
                                className="h-9 w-9 text-(--text-secondary)"
                            >
                                <Edit className="h-4 w-4" />
                            </Button>

                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 text-(--status-error)"
                            >
                                <Ban className="h-4 w-4" />
                            </Button>
                            </div>

                        </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {!loading && hosts.length > 0 && (
          <AdminPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalHosts}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        )}


        {/* Modals */}
        <Modal isOpen={!!viewHost} onClose={() => setViewHost(null)} title="Host Profile" size="lg">
            {viewHost && <ViewHostModal host={viewHost} />}
        </Modal>

        {/* <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create New Host" size="lg">
            <HostManageForm
                onSuccess={handleFormSuccess}
                onCancel={() => setIsCreateModalOpen(false)}
            />
        </Modal> */}

        <Modal isOpen={!!editHost} onClose={() => setEditHost(null)} title="Edit Host" size="lg">
            {editHost && (
              <HostManageForm
                  host={editHost}
                  mode="editMode"
                  onSuccess={handleFormSuccess}
                  onCancel={() => setEditHost(null)}
              />
            )}
        </Modal>

        <ConfirmationModal
          isOpen={!!approveHostId}
          onClose={() => setApproveHostId(null)}
          onConfirm={() => handleHostApplication(approveHostId!, "approve")}
          title="Approve Host"
          description="Are you sure you want to approve this host application?"
          confirmText="Approve"
          variant="default"
        />

        <RejectHostModal
          isOpen={!!rejectHostId}
          onClose={() => setRejectHostId(null)}
          onConfirm={(reason) => {
              if (rejectHostId) {
                handleHostApplication(rejectHostId, "reject", reason);
                setRejectHostId(null);
              }
          }}
        />

      </CardContent>
    </Card>
  );
}