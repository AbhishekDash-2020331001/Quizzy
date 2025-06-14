# Stripe Payment System Setup Guide

## Overview

This backend now includes a credit-based payment system using Stripe. Users start with 10 free credits and can purchase more through Stripe payments.

## Features Added

### 1. Credit System

- **Initial Credits**: Every new user gets 10 free credits upon registration
- **Credit Deduction**: Quiz creation costs credits based on question count (1 credit per 10 questions)
- **Credit Management**: Users can check their balance and purchase more credits

### 2. Payment Integration

- **Stripe Integration**: Secure payment processing with Stripe
- **1:1 Ratio**: 1 dollar = 1 credit
- **Payment Validation**: Proper webhook validation for security
- **Payment History**: Users can view their payment history

## Environment Variables Required

Create a `.env` file in your project root with the following variables:

```env
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

## Installation

1. Install the new dependency:

```bash
pip install stripe==7.8.0
```

2. Run database migrations to add the new tables:

```bash
# The new models will be created automatically when you run the application
# Payment table and credits field in User table will be added
```

## API Endpoints Added

### Credit Management

- `GET /credits/balance` - Get current user's credit balance
- `GET /credits/calculate?questions_count=20` - Calculate credits needed for questions

### Payment Processing

- `POST /payments/create-intent` - Create a Stripe payment intent
- `POST /payments/webhook` - Stripe webhook endpoint (configure in Stripe dashboard)
- `GET /payments/history` - Get user's payment history

### Modified Endpoints

- `POST /exams` - Now checks and deducts credits before creating exams
- `POST /register` - Users now get 10 free credits upon registration

## Stripe Dashboard Setup

1. **Create Webhook Endpoint**:

   - URL: `https://your-domain.com/payments/webhook`
   - Events to send: `payment_intent.succeeded`, `payment_intent.payment_failed`

2. **Get Your Keys**:
   - Secret Key: Found in Developers > API keys
   - Webhook Secret: Found in Developers > Webhooks > Your endpoint

## Credit Calculation Formula

- **0.1 credits per question** (1 credit = 10 questions)
- Examples:
  - 1 question = 0.1 credits
  - 5 questions = 0.5 credits
  - 10 questions = 1.0 credits
  - 15 questions = 1.5 credits
  - 25 questions = 2.5 credits
  - etc.

## Testing

1. Use Stripe test cards for testing payments
2. Test webhook locally using Stripe CLI:

```bash
stripe listen --forward-to localhost:8000/payments/webhook
```

## Security Notes

- All payment processing is handled server-side
- Webhook signature verification ensures requests come from Stripe
- User credits are validated before exam creation
- Payment records are maintained for audit purposes