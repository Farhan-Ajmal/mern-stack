// import { application } from "express";
import Stripe from "stripe";
import Customer from "../models/customer.models.js";
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const stripe = new Stripe(
  "sk_test_51QkKNSFRpxCUo2PABo52EiZ1cCFV3wl5JZLRqnbqfGJOrfMi4KZ21ijcQpWbrsxM3aKSwxHOz3elWWMRVjijsMdb00IUrffgj2"
);

const MAX_RETRIES = 5; // Maximum number of retries
const RETRY_DELAY = 1000; // Delay between retries in milliseconds

// const addSubscriptionToCustomer = async (stripeId, subscriptionData) => {
//   let retries = 0;

//   while (retries < MAX_RETRIES) {
//     try {
//       const customer = await Customer.findOne({ stripeId });

//       if (customer) {
//         customer.subscriptions.push(subscriptionData); // Add subscription to the array
//         await customer.save(); // Save the updated customer
//         console.log("Subscription added successfully to customer:", stripeId);
//         return;
//       } else {
//         console.log(
//           `Customer with stripeId ${stripeId} not found. Retrying...`
//         );
//         retries++;
//         await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
//       }
//     } catch (error) {
//       console.error("Error adding subscription to customer:", error.message);
//       throw error;
//     }
//   }

//   console.error(
//     `Failed to find customer with stripeId ${stripeId} after ${MAX_RETRIES} retries.`
//   );
// };

const pendingSubscriptions = new Map(); // Store pending subscription events

// Retry pending subscriptions periodically
setInterval(async () => {
  for (const [stripeId, dummySubscriptionData] of pendingSubscriptions) {
    console.log(`Retrying subscription update for stripeId: ${stripeId}`);
    await handleCustomerSubscriptionUpdated(stripeId, dummySubscriptionData);
  }
}, 10000); // Retry every 10 seconds

export const handleCustomerSubscriptionAdded = async (
  stripeId,
  subscription
) => {
  try {
    let customer = await Customer.findOne({ stripeId });

    if (!customer) {
      // Temporarily store subscription event data for retry
      pendingSubscriptions.set(stripeId, subscription);
      console.log(`Customer not found for stripeId ${stripeId}. Retrying...`);
      return;
    }

    // Add or update subscription
    customer.subscriptions.push(subscription);

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

export const handleCustomerSubscriptionUpdated = async (
  stripeId,
  updatedSubscriptionData
) => {
  try {
    // Find the customer in the database by Stripe ID
    let customer = await Customer.findOne({ stripeId });

    if (!customer) {
      console.log(`Customer not found for stripeId ${stripeId}. Retrying...`);
      // Temporarily store the subscription event for retrying later
      pendingSubscriptions.set(stripeId, updatedSubscriptionData);
      return;
    }

    // Find the existing subscription by subscriptionId
    const existingSubscriptionIndex = customer.subscriptions.findIndex(
      (sub) => sub.subscriptionId === updatedSubscriptionData.id
    );

    if (existingSubscriptionIndex !== -1) {
      // Update the existing subscription
      customer.subscriptions[existingSubscriptionIndex] = {
        ...customer.subscriptions[existingSubscriptionIndex],
        ...updatedSubscriptionData,
      };
    } else {
      // Add a new subscription if it doesn't exist
      customer.subscriptions.push(updatedSubscriptionData);
    }

    // Save the updated customer document to the database
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
    const stripeId = session.customer; // Stripe customer ID
    const email = session.customer_email; // Customer's email from Stripe

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
    "whsec_0b1525fd1b8fc7aa58a4d03c85a555513b46f127b235474ac4c72d60fe064f80";

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
      console.log("subscriptionData", subscriptionData);
      console.log("subscriptionData.customer", subscription.customer);
      const stripeId = subscription.customer;
      status = subscription.status;
      const dummySubscriptionData1 = {
        subscriptionId: subscription.id,
        cancel_at: subscription.cancel_at,
        // items: subscription.items.data.map((item) => ({
        cancel_at_period_end: subscription.cancel_at_period_end,
        canceled_at: subscription.canceled_at,
        created: subscription.created,
        current_period_end: subscription.current_period_end,
        current_period_start: subscription.current_period_start,
        ended_at: subscription.ended_at,
        // })),
      };
      console.log("subscription.id", subscription.id);
      console.log("subscription.cancel_at", subscription.cancel_at);
      console.log(
        "subscription.cancel_at_period_end",
        subscription.cancel_at_period_end
      );

      const dummySubscriptionData = {
        subscriptionId: subscription.id,
        cancel_at: subscription.cancel_at,
        cancel_at_period_end: subscription.cancel_at_period_end,
      };

      console.log("dummySubscriptionData1", dummySubscriptionData1);
      console.log("dummySubscriptionData", dummySubscriptionData);

      console.log(`Handling subscription created for customer: ${stripeId}`);
      // await addSubscriptionToCustomer(stripeId, dummySubscriptionData);
      // Retry pending subscriptions periodically
      await handleCustomerSubscriptionUpdated(stripeId, dummySubscriptionData1);
      break;

    case "customer.subscription.updated":
      subscription = event.data.object;
      status = subscription.status;
      const updateSubscriptionData = {
        subscriptionId: subscription.id,
        cancel_at: subscription.cancel_at,
        // items: subscription.items.data.map((item) => ({
        cancel_at_period_end: subscription.cancel_at_period_end,
        canceled_at: subscription.canceled_at,
        created: subscription.created,
        current_period_end: subscription.current_period_end,
        current_period_start: subscription.current_period_start,
        ended_at: subscription.ended_at,
        // })),
      };
      await handleCustomerSubscriptionUpdated(
        subscription.customer,
        updateSubscriptionData
      );
      console.log(`Subscription updated. New status: ${status}`);
      break;

    case "invoice.payment_succeeded":
      const invoice = event.data.object;
      console.log(`Invoice payment succeeded for invoice: ${invoice.id}`);
      console.log(`invoice data: ${invoice}`);
      // console.log(
      //   `Formatted Invoice payment data: ${JSON.stringify(invoice, null, 2)}`
      // );
      break;

    case "invoice.payment_failed":
      console.log("Invoice payment failed.");
      break;

    case "payment_intent.succeeded":
      const paymentIntent = event.data.object;
      console.log(`PaymentIntent succeeded: ${paymentIntent.id}`);
      // console.log(`PaymentIntent data: ${paymentIntent}`);
      // console.log(
      //   `Formatted PaymentIntent data: ${JSON.stringify(
      //     paymentIntent,
      //     null,
      //     2
      //   )}`
      // );
      break;

    case "payment_intent.created":
      console.log("PaymentIntent created.");
      break;

    default:
      console.log(`Unhandled event type ${event.type}.`);
  }

  response.send();
};
