"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  History,
  Search,
  Download,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  CreditCard,
} from "lucide-react";
import { PaymentHistoryType } from "@/lib/types";

const PaymentHistory = ({
  paymentHistory,
}: {
  paymentHistory: PaymentHistoryType[];
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "succeeded":
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "failed":
      case "canceled":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "pending":
      case "processing":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "succeeded":
      case "completed":
        return (
          <Badge
            variant="default"
            className="bg-green-100 text-green-800 hover:bg-green-100"
          >
            Success
          </Badge>
        );
      case "failed":
      case "canceled":
        return <Badge variant="destructive">Failed</Badge>;
      case "pending":
      case "processing":
        return (
          <Badge
            variant="secondary"
            className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
          >
            Pending
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredHistory = paymentHistory.filter((payment) => {
    const matchesSearch =
      payment.id.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.amount.toString().includes(searchTerm);
    return matchesSearch;
  });

  const totalAmount = paymentHistory
    .filter(
      (p) =>
        p.status.toLowerCase() === "succeeded" ||
        p.status.toLowerCase() === "completed"
    )
    .reduce((sum, payment) => sum + payment.amount, 0);

  const totalTransactions = paymentHistory.length;
  const successfulTransactions = paymentHistory.filter(
    (p) =>
      p.status.toLowerCase() === "succeeded" ||
      p.status.toLowerCase() === "completed"
  ).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-yellow-primary" />
            Payment History
          </div>
        </CardTitle>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-yellow-primary" />
              <span className="text-sm font-medium">Total Spent</span>
            </div>
            <p className="text-2xl font-bold mt-1">৳{totalAmount}</p>
          </div>
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Successful</span>
            </div>
            <p className="text-2xl font-bold mt-1">{successfulTransactions}</p>
          </div>
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Total Transactions</span>
            </div>
            <p className="text-2xl font-bold mt-1">{totalTransactions}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by transaction ID or amount..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {filteredHistory.length === 0 ? (
          <div className="text-center py-12">
            <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Payment History</h3>
            <p className="text-muted-foreground">
              {history.length === 0
                ? "You haven't made any payments yet."
                : "No payments match your current filters."}
            </p>
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Credits</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHistory.map((payment) => (
                  <TableRow key={payment.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div>
                        {payment.completed_at ? (
                          <p className="text-sm text-muted-foreground">
                            {new Date(
                              payment.completed_at
                            ).toLocaleTimeString()}
                          </p>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            {new Date(payment.created_at).toLocaleTimeString()}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {payment.id}
                      </code>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold">৳{payment.amount}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <span className="font-medium">{payment.amount}</span>
                        <span className="text-xs text-muted-foreground">
                          credits
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(payment.status)}
                        {getStatusBadge(payment.status)}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentHistory;
