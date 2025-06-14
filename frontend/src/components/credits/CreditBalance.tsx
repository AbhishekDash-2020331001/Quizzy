"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Coins, TrendingUp, Wallet } from "lucide-react";

const CreditBalance = ({ oldBalance }: { oldBalance: number | null }) => {
  const [balance, setBalance] = useState<number | null>(oldBalance);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const res = await fetch("/api/credits/balance");
        if (res.ok) {
          const data = await res.json();
          setBalance(data.credits);
        }
      } catch (error) {
        console.error("Failed to fetch credit balance:", error);
      }
      setLoading(false);
    };

    fetchBalance();
  }, []);

  const getBalanceStatus = (balance: number | null) => {
    if (balance === null) return { status: "unknown", color: "secondary" };
    if (balance >= 100) return { status: "excellent", color: "default" };
    if (balance >= 50) return { status: "good", color: "secondary" };
    if (balance >= 20) return { status: "low", color: "destructive" };
    return { status: "critical", color: "destructive" };
  };

  const balanceStatus = getBalanceStatus(balance);

  if (loading) {
    return (
      <Card className="mb-8">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Credit Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="h-12 w-24 bg-muted animate-pulse rounded"></div>
            <div className="h-6 w-16 bg-muted animate-pulse rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-8 border-l-4 border-l-yellow-primary">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-yellow-primary" />
            Credit Balance
          </div>
          <Badge variant={balanceStatus.color as any} className="text-xs">
            {balanceStatus.status}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center gap-2">
              <Coins className="h-8 w-8 text-yellow-primary" />
              <div>
                <p className="text-3xl font-bold text-foreground">
                  {balance !== null ? balance.toLocaleString() : "N/A"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Available Credits
                </p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-green-600">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm font-medium">Active</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {balance !== null && balance < 20
                ? "Consider topping up"
                : "Good to go!"}
            </p>
          </div>
        </div>

        {balance !== null && balance < 20 && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Low Balance:</strong> You have {balance} credits
              remaining. Consider purchasing more to continue using our
              services.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CreditBalance;
