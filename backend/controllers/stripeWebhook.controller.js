// import { application } from "express";
import Stripe from "stripe";
import Customer from "../models/customer.models.js";
import userData from "../models/userData.models.js";
import Subscription from "../models/subscription.models.js";
import Invoice from "../models/invoice.models.js";
const stripe = new Stripe(
  "sk_test_51QkKNSFRpxCUo2PABo52EiZ1cCFV3wl5JZLRqnbqfGJOrfMi4KZ21ijcQpWbrsxM3aKSwxHOz3elWWMRVjijsMdb00IUrffgj2"
);

async function getSubscriptionsByCustomer(customerId) {
  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
  });

  return subscriptions.data;
}

const firebaseUID1 = "firebase_customer_1123";
const firebaseUID = "firebase_user_1123";
const firebaseUID2 = "firebase_invoice_1123";
export const handleInvoice = async (
  customerId,
  customerEmail,
  priceId,
  invoiceData
) => {
  try {
    let existingInvoice = await Invoice.findOne({ customerId });
    const findUserData = await userData.findOne({ email: customerEmail });

    if (!existingInvoice) {
      const newInvoice = new Invoice({
        _id: firebaseUID2,
        customerId,
        invoices: [invoiceData],
      });

      await newInvoice.save(); // Explicit save

      return;
    } else {
      existingInvoice.invoices.push(invoiceData);
    }
    await existingInvoice.save();
    // console.log("Invoice stored successfully:", newInvoice);

    let credits;
    switch (priceId) {
      case "price_1QkKUWFRpxCUo2PA0IBMb8Tk":
        credits = 1000;
        break;
      case "price_1QmYTXFRpxCUo2PAFt5uOEWY":
        credits = 10000;
        break;

      default:
        break;
    }

    if (!findUserData) {
      console.log("user data not found. creating new user...");
      await userData.create({
        customer: customerId,
        email: customerEmail,
        credits: credits,
        isPro: true,
        priceId: priceId,
        period: {
          start: invoiceData.period.start, // Convert from Unix timestamp
          end: invoiceData.period.end,
        },
      });
    } else {
      await userData.updateOne(
        { email: customerEmail },
        {
          credits: credits,
          isPro: true,
          priceId: priceId,
          period: {
            start: invoiceData.period.start, // Convert from Unix timestamp
            end: invoiceData.period.end,
          },
        }
      );
    }
  } catch (error) {
    console.error("Error storing invoice:", error.message);
  }
};

// Example Usage

export const handleCheckoutSessionCompleted = async (userId, session) => {
  try {
    const stripeId = session.customer; // Stripe customer ID
    const email = session.metadata.userEmail; // Customer's email from Stripe

    if (!userId || !stripeId || !email) {
      throw new Error("Missing required session metadata or customer details.");
    }

    // Check if the user already exists in the database
    const customer = await Customer.findById(userId);
    // console.log("customer", customer);

    if (customer) {
      // If the user exists, update their data
      customer.email = email;
      customer.stripeId = stripeId;
      console.log(`Customer updated for userId: ${userId}`);
    } else {
      // If the user doesn't exist, create a new document
      console.log(`Creating new customer for userId: ${userId}`);
      await Customer.create({
        _id: firebaseUID1,
        email,
        stripeId,
        subscription: firebaseUID,
      });
      await Customer.collection.createIndex({ stripeId: 1 });
    }

    // Save changes to the database
    await customer?.save();
    console.log("Customer saved successfully.");
  } catch (error) {
    console.error("Error handling checkout session completed:", error.message);
  }
};
export const handleCustomerSubscriptionUpdated = async (
  stripeId,
  updatedSubscriptionData
) => {
  try {
    if (!stripeId || !updatedSubscriptionData) {
      throw new Error("Missing stripeId or updatedSubscriptionData.");
    }

    // Find the subscription document for this customer
    let existingSubscriptionDoc = await Subscription.findOne({ stripeId });

    if (!existingSubscriptionDoc) {
      // If no document exists, create a new one with subscriptions as an array
      await Subscription.create({
        _id: firebaseUID,
        stripeId,
        subscriptions: [updatedSubscriptionData], // Store subscriptions in an array
        invoice: firebaseUID2,
      });

      console.log("Created new subscription document for the customer.");
      return;
    }
    const findSubscriptions = await stripe.subscriptions.list({
      customer: stripeId,
      status: "active",
    });

    const activeSubscriptions = findSubscriptions.data.filter((sub) => {
      return (
        sub.cancel_at_period_end === false &&
        sub.id !== updatedSubscriptionData.subscriptionId
      );
    });

    const activeSubIds = activeSubscriptions.map((sub) => {
      return sub.id;
    });

    // cancel active subscriptions
    activeSubIds.map(async (subscriptionId) => {
      await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });
    });

    // Ensure subscriptions field is an array
    if (!Array.isArray(existingSubscriptionDoc.subscriptions)) {
      existingSubscriptionDoc.subscriptions =
        existingSubscriptionDoc.subscriptions
          ? [existingSubscriptionDoc.subscriptions] // Convert existing object to array
          : [];
    }

    // Find if the subscription already exists within the array
    let existingSubscriptionIndex =
      existingSubscriptionDoc.subscriptions.findIndex(
        (sub) => sub.subscriptionId === updatedSubscriptionData.subscriptionId
      );

    console.log("existingSubscriptionIndex", existingSubscriptionIndex);

    if (existingSubscriptionIndex !== -1) {
      // Update the existing subscription in the array
      existingSubscriptionDoc.subscriptions[existingSubscriptionIndex] = {
        ...existingSubscriptionDoc.subscriptions[existingSubscriptionIndex],
        ...updatedSubscriptionData,
      };

      console.log(
        `Updated existing subscription for ${stripeId}:`,
        existingSubscriptionDoc.subscriptions[existingSubscriptionIndex]
      );
    } else {
      // If subscription doesn't exist, add it to the subscriptions array
      if (!updatedSubscriptionData || !updatedSubscriptionData.subscriptionId) {
        throw new Error("Invalid subscription data: missing subscriptionId");
      }

      const filtered = existingSubscriptionDoc.subscriptions.filter(
        (sub) => sub.subscriptionId !== updatedSubscriptionData.subscriptionId
      );

      filtered.push(updatedSubscriptionData);
      existingSubscriptionDoc.subscriptions = filtered;

      // existingSubscriptionDoc.subscriptions.push(updatedSubscriptionData);
      console.log("Added new subscription to existing customer.");
    }

    // Save the updated document
    await existingSubscriptionDoc.save();
    console.log("Customer subscription updated successfully.");
  } catch (error) {
    console.error(
      "Error handling customer subscription update:",
      error.message
    );
    console.error("Stack trace:", error.stack);
  }
};
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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
        cancel_at: subscription.cancel_at
          ? new Date(subscription.cancel_at * 1000)
          : null,
        cancel_at_period_end: subscription.cancel_at_period_end,
        canceled_at: subscription.canceled_at
          ? new Date(subscription.canceled_at * 1000)
          : null,
        created: new Date(subscription.created * 1000),
        current_period_end: new Date(subscription.current_period_end * 1000),
        current_period_start: new Date(
          subscription.current_period_start * 1000
        ),
        ended_at: subscription.ended_at
          ? new Date(subscription.ended_at)
          : null,
      };

      console.log(`Handling subscription created for customer: ${stripeId}`);

      await handleCustomerSubscriptionUpdated(stripeId, dummySubscriptionData1);
      break;

    case "customer.subscription.updated":
      subscription = event.data.object;
      status = subscription.status;
      const updateSubscriptionData = {
        subscriptionId: subscription.id,
        cancel_at: subscription.cancel_at
          ? new Date(subscription.cancel_at * 1000)
          : null,
        cancel_at_period_end: subscription.cancel_at_period_end,
        canceled_at: subscription.canceled_at
          ? new Date(subscription.canceled_at * 1000)
          : null,
        created: subscription.created
          ? new Date(subscription.created * 1000)
          : null,
        current_period_end: new Date(subscription.current_period_end * 1000),
        current_period_start: new Date(
          subscription.current_period_start * 1000
        ),
        ended_at: subscription.ended_at
          ? new Date(subscription.ended_at * 1000)
          : null,
      };
      console.log("it should not be called");

      await handleCustomerSubscriptionUpdated(
        subscription.customer,
        updateSubscriptionData
      );
      console.log(`Subscription updated. New status: ${status}`);
      break;

    case "invoice.payment_succeeded":
      const invoice = event.data.object;
      const invoiceData1 = JSON.stringify(event.data.object, null, 2);
      console.log("invoiceData1", invoiceData1);

      const invoiceData = {
        // customer: invoice.customer,
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

      const priceId = invoice.lines.data[0].plan.id;
      handleInvoice(
        invoice.customer,
        invoice.customer_email,
        priceId,
        invoiceData
      );

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
