"use client";

import type React from "react";
import { useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CreditCard,
  Shield,
  Zap,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { createPaymentIntentAction } from "@/action/payment.action";

const PaymentForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [amount, setAmount] = useState(250);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const creditPackages = [
    { credits: 15, price: 150, popular: false, savings: 0 },
    { credits: 25, price: 250, popular: true, savings: 0 },
    { credits: 50, price: 500, popular: false, savings: 0 },
    { credits: 100, price: 1000, popular: false, savings: 0 },
  ];

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setProcessing(true);
    setError(null);

    if (!stripe || !elements) {
      setError("Stripe has not loaded yet. Please try again.");
      setProcessing(false);
      return;
    }

    try {
      // Create payment intent on the server
      const res = await createPaymentIntentAction(amount);

      if (!res.success) {
        throw new Error("Failed to create payment intent");
      }

      const { client_secret } = res.data;

      const cardElement = elements.getElement(CardElement);

      if (cardElement) {
        const { error, paymentIntent } = await stripe.confirmCardPayment(
          client_secret,
          {
            payment_method: {
              card: cardElement,
            },
          }
        );

        if (error) {
          setError(error.message || "An unexpected error occurred.");
        } else {
          setSuccess(true);
          console.log("Payment successful:", paymentIntent);
          // Refresh the page or update credit balance
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        }
      }
    } catch (err) {
      setError("Payment failed. Please try again.");
    }

    setProcessing(false);
  };

  if (success) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="text-center">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              Payment Successful!
            </h3>
            <p className="text-green-700 mb-4">
              Your account has been credited with {amount} credits.
            </p>
            <p className="text-sm text-green-600">Redirecting...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-yellow-primary" />
          Purchase Credits
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Choose a credit package and complete your purchase securely
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Credit Packages */}
        <div>
          <Label className="text-base font-medium mb-3 block">
            Choose Package
          </Label>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {creditPackages.map((pkg) => (
              <div
                key={pkg.credits}
                className={`relative p-3 border rounded-lg cursor-pointer transition-all hover:border-yellow-primary ${
                  amount === pkg.price
                    ? "border-yellow-primary bg-yellow-50"
                    : "border-border"
                } ${
                  pkg.popular
                    ? "ring-2 ring-yellow-primary ring-opacity-20"
                    : ""
                }`}
                onClick={() => setAmount(pkg.price)}
              >
                {pkg.popular && (
                  <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-yellow-primary text-black text-xs">
                    Popular
                  </Badge>
                )}
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Zap className="h-4 w-4 text-yellow-primary" />
                    <span className="font-bold">{pkg.credits}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">credits</p>
                  <p className="font-semibold mt-1">৳{pkg.price}</p>
                  {pkg.savings > 0 && (
                    <p className="text-xs text-green-600 font-medium">
                      Save {pkg.savings}%
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Custom Amount */}
        <div>
          <Label htmlFor="amount" className="text-base font-medium">
            Or enter custom amount
          </Label>
          <div className="mt-2 relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              ৳
            </span>
            <Input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="pl-8"
              min="1"
              max="1000"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            You'll receive {amount} credits for ৳{amount}
          </p>
        </div>

        {/* Payment Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-base font-medium mb-2 block">
              Payment Information
            </Label>
            <div className="p-4 border rounded-lg bg-background">
              <CardElement
                options={{
                  hidePostalCode: true,
                  style: {
                    base: {
                      fontSize: "16px",
                      color: "#424770",
                      "::placeholder": {
                        color: "#aab7c4",
                      },
                    },
                  },
                }}
              />
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="h-4 w-4" />
            <span>Your payment is secured by Stripe</span>
          </div>

          <Button
            type="submit"
            disabled={!stripe || processing || amount < 1}
            className="w-full bg-yellow-primary hover:bg-yellow-primary/90 text-black font-medium"
            size="lg"
          >
            {processing ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Processing...
              </div>
            ) : (
              `Pay ৳${amount} for ${amount} Credits`
            )}
          </Button>
        </form>

        <div className="text-center text-xs text-muted-foreground">
          <p>By completing this purchase, you agree to our Terms of Service.</p>
          <p className="mt-1">Credits never expire and are non-refundable.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentForm;
