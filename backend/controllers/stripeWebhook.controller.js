// import { application } from "express";
import Stripe from "stripe";
import Customer from "../models/customer.models.js";
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const stripe = new Stripe(
  "sk_test_51Otnl4DPA0JjYlhgNqTQRCW2NiDMP5chcNp8lURw0NapSlEyYA2PGO5TUkwrWsy2qqvp0qVHnmmt2Nie6NEUd1Aw00VeWD2cYi"
);

export const addOrUpdateSubscription = async (stripeId, subscriptionData) => {
  // const stripeId = subscriptionData.customer;

  try {
    let customer = await Customer.findOne({ stripeId });

    if (!customer) {
      // Temporarily store subscription event data for retry
      pendingSubscriptions.set(stripeId, subscriptionData);
      console.log(`Customer not found for stripeId ${stripeId}. Retrying...`);
      return;
    }

    // Add or update subscription
    customer.subscriptions.push({
      subscriptionId: subscriptionData.id,
      startDate: new Date(subscriptionData.current_period_start * 1000),
      endDate: new Date(subscriptionData.current_period_end * 1000),
      status: subscriptionData.status,
    });

    await customer.save();
    console.log("Customer subscription updated successfully.");

    // Remove from pending if it exists
    pendingSubscriptions.delete(stripeId);
  } catch (error) {
    console.error(
      "Error handling customer subscription updated:",
      error.message
    );
  }
};
export const handleCheckoutSessionCompleted = async (userId, session) => {
  try {
    console.log("session", session);

    const stripeId = session.customer; // Stripe customer ID
    const email = session.customer_email; // Customer's email from Stripe
    console.log("stripeId", stripeId);
    console.log("email", email);
    console.log("userId", userId);

    if (!userId || !stripeId || !email) {
      throw new Error("Missing required session metadata or customer details.");
    }

    // Check if the user already exists in the database
    const customer = await Customer.findById(userId);

    if (customer) {
      // If the user exists, update their data
      customer.email = email;
      customer.stripeId = stripeId;
      console.log(`Customer updated for userId: ${userId}`);
    } else {
      // If the user doesn't exist, create a new document
      console.log(`Creating new customer for userId: ${userId}`);
      await Customer.create({
        _id: userId,
        email,
        stripeId,
      });
    }

    // Save changes to the database
    await customer?.save();
    console.log("Customer saved successfully.");
  } catch (error) {
    console.error("Error handling checkout session completed:", error.message);
  }
};

export const getRealtimeData = async (request, response) => {
  let event = request.body;

  const endpointSecret =
    "whsec_015be206619cfd9a3b57daf7ba0f3906c48ddfef2444aeddb00933e40b0d694e";

  if (endpointSecret) {
    const signature = request.headers["stripe-signature"];
    try {
      event = stripe.webhooks.constructEvent(
        request.body,
        signature,
        endpointSecret
      );
    } catch (err) {
      console.log("⚠️  Webhook signature verification failed.", err.message);
      return response.sendStatus(400);
    }
  }
  let subscription;
  let status;
  let userId;

  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object;
      userId = session.metadata.userId; // Get userId from metadata
      console.log("userIduserIduserIduserId", userId);

      console.log("Checkout session completed:", session);
      await handleCheckoutSessionCompleted(userId, session);
      break;
    case "customer.subscription.created":
      subscription = event.data.object;
      const subscriptionData = JSON.stringify(event.data.object, null, 2);
      const stripeId = subscriptionData.customer;
      status = subscription.status;
      console.log(`Subscription created with status: ${status}`);
      console.log(
        `Subscription created with dat: ${JSON.stringify(
          event.data.object,
          null,
          2
        )}`
      );
      // addOrUpdateSubscription(stripeId, subscriptionData);
      // Retry pending subscriptions periodically
      setInterval(async () => {
        for (const [stripeId, subscriptionData] of pendingSubscriptions) {
          console.log(`Retrying subscription update for stripeId: ${stripeId}`);
          await handleCustomerSubscriptionUpdated(subscriptionData);
        }
      }, 10000); // Retry every 10 seconds
      break;

    case "customer.subscription.updated":
      subscription = event.data.object;
      status = subscription.status;
      console.log(`Subscription updated. New status: ${status}`);
      break;

    case "invoice.payment_succeeded":
      const invoice = event.data.object;
      console.log(`Invoice payment succeeded for invoice: ${invoice.id}`);
      console.log(`invoice data: ${invoice}`);
      console.log(
        `Formatted Invoice payment data: ${JSON.stringify(invoice, null, 2)}`
      );
      break;

    case "invoice.payment_failed":
      console.log("Invoice payment failed.");
      break;

    case "payment_intent.succeeded":
      const paymentIntent = event.data.object;
      console.log(`PaymentIntent succeeded: ${paymentIntent.id}`);
      console.log(`PaymentIntent data: ${paymentIntent}`);
      console.log(
        `Formatted PaymentIntent data: ${JSON.stringify(
          paymentIntent,
          null,
          2
        )}`
      );
      break;

    case "payment_intent.created":
      console.log("PaymentIntent created.");
      break;

    default:
      console.log(`Unhandled event type ${event.type}.`);
  }

  response.send();
};
