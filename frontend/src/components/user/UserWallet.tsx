// frontend/src/components/user/UserWallet.tsx

import { useState, useEffect, useCallback, useRef } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown, Wallet, TrendingUp, TrendingDown, ArrowDownToLine } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge }   from "@/components/ui/badge";
import { Button }  from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserPagination }  from "@/components/user/UserPagination";
import { LoadingSpinner1 } from "@/components/common/LoadingSpinner1";

import { walletServices }     from "@/services/walletServices";
import { getApiErrorMessage } from "@/utils/errorMessages.utils";
import { formatDate2 }        from "@/utils/dateAndTimeFormats";
import { toast }              from "react-toastify";

import {
  type ITransactionState,
  type WalletOverviewResponse,
  type TransactionSortField,
  type GetTransactionsParams,
  type GetTransactionsResponse,
} from "@/types/wallet.types";
import { 
  formatTransactionAmount, 
  getTransactionStatusVariant, 
  TRANSACTION_TYPE_LABELS 
} from "@/utils/UI.utils";
import { useAuth } from "@/contexts/AuthContext";
import { toTitleCase } from "@/utils/namingConventions";
import { TRANSACTION_DIRECTION, TRANSACTION_STATUS, TRANSACTION_TYPE, type TransactionDirection, type TransactionStatus, type TransactionType } from "@/constants/transaction.constants";





function UserWallet() {
  const [walletOverview, setOverview]   = useState<WalletOverviewResponse | null>(null);
  const [transactions, setTransactions] = useState<ITransactionState[]>([]);
  const [totalCount,   setTotalCount]   = useState(0);
  const [totalPages,   setTotalPages]   = useState(1);
  const [currentPage,  setCurrentPage]  = useState(1);
  const [loading,      setLoading]      = useState(true);
  const [txLoading,    setTxLoading]    = useState(false);
  const [error,        setError]        = useState<string | null>(null);

  const [directionFilter, setDirectionFilter] = useState<"all" | TransactionDirection>("all");
  const [typeFilter,      setTypeFilter]      = useState<"all" | TransactionType>("all");
  const [statusFilter,    setStatusFilter]    = useState<"all" | TransactionStatus>("all");
  const [sortBy,          setSortBy]          = useState<TransactionSortField>("createdAt");
  const [sortOrder,       setSortOrder]       = useState<"asc" | "desc">("desc");

  const itemsPerPage = 10;
  const hasFetched   = useRef(false);
  const {user} = useAuth()


  // ── Initial overview fetch (balance + last 10) ──────────────────────────
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchOverview = async () => {
      setLoading(true);
      try {
        const response: WalletOverviewResponse = await walletServices.getWalletOverview();
        console.log('fetchOverview response :', response)
        setOverview(response);
        setTransactions(response.recentTransactions);
        setTotalCount(response.recentTransactions.length);

      } catch (error: unknown) {
        const errorMessage = getApiErrorMessage(error);
        if (errorMessage) toast.error(errorMessage);
        setError(errorMessage ?? null);

      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, []);


  // ── Paginated / filtered transaction fetch ───────────────────────────────
  const fetchTransactions = useCallback(async () => {
    setTxLoading(true);
    try {
      const params: GetTransactionsParams = {
        page      : currentPage,
        limit     : itemsPerPage,
        sortBy,
        sortOrder,
        ...(directionFilter !== "all" && { direction : directionFilter }),
        ...(typeFilter      !== "all" && { type      : typeFilter }),
        ...(statusFilter    !== "all" && { status    : statusFilter }),
      };

      const response: GetTransactionsResponse = await walletServices.getTransactions(params);
      setTransactions(response.transactions);
      setTotalCount(response.pagination.totalCount);
      setTotalPages(response.pagination.totalPages);

    } catch (error: unknown) {
      const errorMessages = getApiErrorMessage(error);
      if (errorMessages) toast.error(errorMessages);

    } finally {
      setTxLoading(false);
    }
  }, [currentPage, directionFilter, typeFilter, statusFilter, sortBy, sortOrder]);


  // Re-fetch whenever filters/page/sort change (but not on initial mount — overview handles that)
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    fetchTransactions();
  }, [fetchTransactions]);


  const handleSort = (field: TransactionSortField) => {
    if (sortBy === field) {
      setSortOrder(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
    setCurrentPage(1);
  };

  const getSortIcon = (field: TransactionSortField) => {
    if (sortBy !== field) return <ArrowUpDown className="inline h-3.5 w-3.5 ml-1 opacity-50" />;
    return sortOrder === "asc"
      ? <ArrowUp   className="inline h-3.5 w-3.5 ml-1" />
      : <ArrowDown className="inline h-3.5 w-3.5 ml-1" />;
  };

  const hasActiveFilters = directionFilter !== "all" || typeFilter !== "all" || statusFilter !== "all";

  // Compute credited / debited totals from current view for the summary cards
  const totalCredited = transactions
    .filter(tx => tx.direction === TRANSACTION_DIRECTION.CREDIT && tx.status === TRANSACTION_STATUS.COMPLETED)
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalDebited = transactions
    .filter(tx => tx.direction === TRANSACTION_DIRECTION.DEBIT && tx.status === TRANSACTION_STATUS.COMPLETED)
    .reduce((sum, tx) => sum + tx.amount, 0);



  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner1 size="lg" message="Loading wallet..." />
      </div>
    );
  }



  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Wallet className="h-6 w-6" />
          My Wallet
        </h2>
        <Button variant="primaryOutline" size="sm" className="flex items-center gap-2">
          <ArrowDownToLine className="h-4 w-4" />
          Withdraw
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

        <div className="bg-secondary rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">Available balance</p>
          <p className="text-2xl font-semibold">
            ₹{(walletOverview?.walletBalance ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className="bg-secondary rounded-lg p-4">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
            <TrendingUp className="h-3.5 w-3.5 text-green-500" />
            Total credited
          </div>
          <p className="text-2xl font-semibold text-green-500">
            + ₹{totalCredited.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className="bg-secondary rounded-lg p-4">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
            <TrendingDown className="h-3.5 w-3.5 text-red-400" />
            Total debited
          </div>
          <p className="text-2xl font-semibold text-red-400">
            − ₹{totalDebited.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </p>
        </div>

      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">

        <Select
          value={typeFilter}
          onValueChange={(v) => {
            setTypeFilter(v as "all" | TransactionType);
            setCurrentPage(1);
          }}
        >
          <SelectTrigger className="w-44 h-10">
            <SelectValue placeholder="Transaction type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {Object.values(TRANSACTION_TYPE).map(t => (
              <SelectItem key={t} value={t}>{TRANSACTION_TYPE_LABELS[t]}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={directionFilter}
          onValueChange={(v) => {
            setDirectionFilter(v as "all" | TransactionDirection);
            setCurrentPage(1);
          }}
        >
          <SelectTrigger className="w-40 h-10">
            <SelectValue placeholder="Direction" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All directions</SelectItem>
            <SelectItem value={TRANSACTION_DIRECTION.CREDIT}>Credit (+)</SelectItem>
            <SelectItem value={TRANSACTION_DIRECTION.DEBIT}>Debit (−)</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v as "all" | TransactionStatus);
            setCurrentPage(1);
          }}
        >
          <SelectTrigger className="w-36 h-10">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value={TRANSACTION_STATUS.COMPLETED}>Completed</SelectItem>
            <SelectItem value={TRANSACTION_STATUS.PENDING}>Pending</SelectItem>
            <SelectItem value={TRANSACTION_STATUS.FAILED}>Failed</SelectItem>
          </SelectContent>
        </Select>

      </div>

      {/* Table */}
      <div className="rounded-lg bg-card relative">
        {txLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60 backdrop-blur-sm rounded-lg">
            <LoadingSpinner1 size="lg" message="Loading transactions..." />
          </div>
        )}

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">#</TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("createdAt")}
              >
                Date {getSortIcon("createdAt")}
              </TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead
                className="cursor-pointer text-right"
                onClick={() => handleSort("amount")}
              >
                Amount {getSortIcon("amount")}
              </TableHead>
              <TableHead className="text-right">Balance after</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {error ? (
              <TableRow>
                <TableCell colSpan={7} className="h-48 text-center text-destructive">
                  {error}
                </TableCell>
              </TableRow>

            ) : transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-48 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Wallet className="h-10 w-10 opacity-20" />
                    <p className="text-sm">No transactions found</p>
                    {hasActiveFilters && (
                      <p className="text-xs">Try adjusting your filters</p>
                    )}
                  </div>
                </TableCell>
              </TableRow>

            ) : (
              transactions.map((tx, idx) => {
                const isCredit = tx.direction === TRANSACTION_DIRECTION.CREDIT;

                return (
                  <TableRow key={tx.transactionId}>

                    <TableCell className="text-muted-foreground">
                      {(currentPage - 1) * itemsPerPage + idx + 1}
                    </TableCell>

                    <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                      {formatDate2(tx.createdAt)}
                    </TableCell>

                    <TableCell>
                      <Badge variant="outline" className="font-normal text-xs">
                        {toTitleCase(TRANSACTION_TYPE_LABELS[tx.type] ?? tx.type)}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-muted-foreground text-xs max-w-60">
                      <span className="truncat block">{tx.description ?? "—"}</span>
                    </TableCell>

                    <TableCell className="text-center">
                      <Badge variant={getTransactionStatusVariant(tx.status)}>
                        {tx.status.charAt(0) + tx.status.slice(1).toLowerCase()}
                      </Badge>
                    </TableCell>

                    <TableCell className={`text-right font-medium whitespace-nowrap ${
                      isCredit ? "text-green-500" : "text-red-400"
                    }`}>
                      {formatTransactionAmount(tx.amount, tx.direction)}
                    </TableCell>

                    <TableCell className="text-right text-muted-foreground">
                      ₹{tx.balanceAfter.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </TableCell>

                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {totalCount > 0
            ? `Showing ${(currentPage - 1) * itemsPerPage + 1}–${Math.min(currentPage * itemsPerPage, totalCount)} of ${totalCount} transactions`
            : "No transactions"
          }
        </p>
        <UserPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

    </div>
  );
}

export default UserWallet;