// import { application } from "express";
import Stripe from "stripe";
import Customer from "../models/customer.models.js";
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const stripe = new Stripe(
  "sk_test_51QkKNSFRpxCUo2PABo52EiZ1cCFV3wl5JZLRqnbqfGJOrfMi4KZ21ijcQpWbrsxM3aKSwxHOz3elWWMRVjijsMdb00IUrffgj2"
);

// const pendingSubscriptions = new Map(); // Store pending subscription events
// const pendingSubscriptions2 = new Map(); // Store pending subscription events

// Retry pending subscriptions periodically
// setInterval(async () => {
//   for (const [stripeId, dummySubscriptionData] of pendingSubscriptions) {
//     console.log(`Retrying subscription update for stripeId: ${stripeId}`);
//     await handleCustomerSubscriptionUpdated(stripeId, dummySubscriptionData);
//   }
//   for (const [stripeId, dummySubscriptionData] of pendingSubscriptions2) {
//     console.log(`Retrying invoice update for stripeId: ${stripeId}`);
//     await handleInvoice(stripeId, dummySubscriptionData);
//   }
// }, 10000); // Retry every 10 seconds

export const handleCustomerSubscriptionAdded = async (
  stripeId,
  subscription
) => {
  try {
    let customer = await Customer.findOne({ stripeId });

    if (!customer) {
      // Temporarily store subscription event data for retry
      // pendingSubscriptions.set(stripeId, subscription);
      console.log(`Customer not found for stripeId ${stripeId}. Retrying...`);
      return;
    }

    // Add or update subscription
    customer.subscriptions.push(subscription);

    await customer.save();
    console.log("Customer subscription updated successfully.");

    // Remove from pending if it exists
    // pendingSubscriptions.delete(stripeId);
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
    console.log("updatedSubscriptionData", updatedSubscriptionData);

    if (!customer) {
      console.log(`Customer not found for stripeId ${stripeId}. Retrying...`);
      // Temporarily store the subscription event for retrying later
      // pendingSubscriptions.set(stripeId, updatedSubscriptionData);
      return;
    }

    // Find the existing subscription by subscriptionId
    const existingSubscriptionIndex = customer.subscriptions.findIndex(
      (sub) => sub.subscriptionId === updatedSubscriptionData.subscriptionId
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
    // pendingSubscriptions.delete(stripeId);
  } catch (error) {
    console.error(
      "Error handling customer subscription updated:",
      error.message
    );
  }
};

export const handleInvoice = async (stripeId, invoiceData) => {
  try {
    // Find the customer in the database by Stripe ID
    let customer = await Customer.findOne({ stripeId });
    console.log("invoiceData", invoiceData);

    if (!customer) {
      console.log(`invoice not found for stripeId ${stripeId}. Retrying...`);
      // Temporarily store the subscription event for retrying later
      // pendingSubscriptions2.set(stripeId, invoiceData);
      return;
    }

    // Find the existing subscription by subscriptionId
    const existingSubscriptionIndex = customer.subscriptions.findIndex(
      (sub) => sub.subscriptionId === invoiceData.subscription
    );
    console.log("existingSubscriptionIndex", existingSubscriptionIndex);

    // if (existingSubscriptionIndex !== -1) {
    // Update the existing subscription
    const existingSubscription =
      customer.subscriptions[existingSubscriptionIndex];
    console.log("existingSubscription", existingSubscription);

    existingSubscription.invoice.push(invoiceData);

    // Save the updated customer document to the database
    await customer.save();
    console.log("invoiceData updated successfully.");

    // Remove from pending if it exists
    // pendingSubscriptions2.delete(stripeId);
  } catch (error) {
    console.error("Error handling invoiceData update:", error.message);
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

      const stripeId = subscription.customer;
      status = subscription.status;
      const testingSec = 1737699399;
      const secToms = testingSec * 1000;
      const conToDate = new Date(secToms);

      const dummySubscriptionData1 = {
        subscriptionId: subscription.id,
        cancel_at: new Date(subscription.cancel_at * 1000),
        cancel_at_period_end: subscription.cancel_at_period_end,
        canceled_at: new Date(subscription.canceled_at * 1000),
        created: subscription.created,
        current_period_end: new Date(subscription.current_period_end * 1000),
        current_period_start: new Date(
          subscription.current_period_start * 1000
        ),
        ended_at: subscription.ended_at,
      };

      const dummySubscriptionData = {
        subscriptionId: subscription.id,
        cancel_at: subscription.cancel_at,
        cancel_at_period_end: subscription.cancel_at_period_end,
      };

      console.log(`Handling subscription created for customer: ${stripeId}`);
      // await addSubscriptionToCustomer(stripeId, dummySubscriptionData);
      // Retry pending subscriptions periodically
      // setTimeout(async () => {
        await handleCustomerSubscriptionUpdated(
          stripeId,
          dummySubscriptionData1
        );
      // }, 10000);
      break;

    case "customer.subscription.updated":
      subscription = event.data.object;
      status = subscription.status;
      const updateSubscriptionData = {
        subscriptionId: subscription.id,
        cancel_at: new Date(subscription.cancel_at * 1000),
        cancel_at_period_end: subscription.cancel_at_period_end,
        canceled_at: new Date(subscription.canceled_at * 1000),
        created: subscription.created,
        current_period_end: new Date(subscription.current_period_end * 1000),
        current_period_start: new Date(
          subscription.current_period_start * 1000
        ),
        ended_at: subscription.ended_at,
      };

      // console.log("updatedSubscriptionData1234567890", updateSubscriptionData);

      // setTimeout(async () => {
        await handleCustomerSubscriptionUpdated(
          subscription.customer,
          updateSubscriptionData
        );
      // }, 10000);
      console.log(`Subscription updated. New status: ${status}`);
      break;

    case "invoice.payment_succeeded":
      const invoice = event.data.object;
      const invoiceData1 = JSON.stringify(event.data.object, null, 2);
      const invoiceData = {
        invoice_id: invoice.id,
        amount_due: invoice.amount_due,
        amount_paid: invoice.amount_paid,
        currency: invoice.currency,
        customer: invoice.customer,
        period: {
          start: new Date(invoice.lines.data[0].period.start * 1000), // Convert from Unix timestamp
          end: new Date(invoice.lines.data[0].period.end * 1000),
        },
        subscription: invoice.lines.data[0].subscription,
      };
      console.log(`Invoice payment succeeded for invoice: ${invoice.id}`);
      console.log(`invoice: ${invoice}`);
      console.log(`invoice data: ${invoiceData1}`);
      console.log(
        `id: ${invoice.id}, amount_due: ${invoice.amount_due}, amount_paid: ${invoice.amount_paid},currency: ${invoice.currency},customer: ${invoice.customer}`
      );
      console.log("qwerty", invoice.lines.data[0]);
      // setTimeout(async () => {
      await handleInvoice(invoice.customer, invoiceData);
      // }, 10000);

      break;

    case "invoice.payment_failed":
      console.log("Invoice payment failed.");
      break;

    case "payment_intent.succeeded":
      const paymentIntent = event.data.object;
      console.log(`PaymentIntent succeeded: ${paymentIntent.id}`);

      break;

    case "payment_intent.created":
      console.log("PaymentIntent created.");
      break;

    default:
      console.log(`Unhandled event type ${event.type}.`);
  }

  response.send();
};
