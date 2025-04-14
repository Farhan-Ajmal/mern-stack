// import { application } from "express";
import Stripe from "stripe";
import Customer from "../models/customer.models.js";
import User from "../models/user.models.js";
import userData from "../models/userData.models.js";
import Subscription from "../models/subscription.models.js";
import Invoice from "../models/invoice.models.js";
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

// export const handleCustomerSubscriptionUpdated = async (
//   stripeId,
//   subscription
// ) => {
//   try {
//     let customer = await Customer.findOne({ stripeId });

//     if (!customer) {
//       // Temporarily store subscription event data for retry
//       // pendingSubscriptions.set(stripeId, subscription);
//       console.log(`Customer not found for stripeId ${stripeId}. Retrying...`);
//       return;
//     }

//     // Add or update subscription
//     customer.subscriptions.push(subscription);

//     await customer.save();
//     console.log("Customer subscription updated successfully.");

//     // Remove from pending if it exists
//     // pendingSubscriptions.delete(stripeId);
//   } catch (error) {
//     console.error(
//       "Error handling customer subscription updated:",
//       error.message
//     );
//   }
// };

// export const handleInvoice = async (
//   stripeId,
//   customerEmail,
//   priceId,
//   invoiceData
// ) => {
//   try {
//     if (!stripeId || !invoiceData) {
//       throw new Error("Missing stripeId or invoiceData.");
//     }

//     // Find the customer in the database by Stripe ID
//     let customer = await Customer.findOne({ stripeId });
//     let user = await User.findOne({ email: customerEmail });
//     const findUserData = await userData.findOne({ email: customerEmail });
//     console.log("Invoice data received:", invoiceData);

//     if (!customer || !user) {
//       console.warn(
//         `Customer or user not found for stripeId ${stripeId} or customerEmail ${customerEmail}.`
//       );
//       return;
//     }

//     console.log("Customer found:", customer);

//     // Retry mechanism to find the existing subscription by subscriptionId
//     const existingSubscriptionIndex = await retryWithExponentialBackoff(
//       async () => {
//         const index = customer.subscriptions.findIndex(
//           (sub) => sub.subscriptionId === invoiceData.subscription
//         );

//         if (index === -1) {
//           throw new Error("Subscription not found. Retrying....");
//         }

//         return index;
//       }
//     );
//     console.log(
//       "existingSubscriptionIndex in handle invoice",
//       existingSubscriptionIndex
//     );

//     const currentSubscription = customer.subscriptions.find(
//       (sub) => sub.subscriptionId === invoiceData.subscription
//     );
//     console.log("currentSubscription.invoice", currentSubscription);

//     let currentSubscriptionIndex = -1;
//     if (currentSubscription.invoice) {
//       currentSubscriptionIndex = currentSubscription.invoice.findIndex(
//         (invoice) => invoice.invoice_id === invoiceData.invoice_id
//       );
//     }

//     console.log("currentSubscription", currentSubscription);
//     console.log("currentSubscriptionIndex", currentSubscriptionIndex);

//     console.log(
//       "Existing subscription index invoice:",
//       existingSubscriptionIndex
//     );

//     // const existingInvoice =
//     //   customer.subscriptions[existingSubscriptionIndex].invoice[
//     //     currentSubscriptionIndex
//     //   ];
//     if (currentSubscriptionIndex !== -1) {
//       customer.subscriptions[existingSubscriptionIndex].invoice[
//         currentSubscriptionIndex
//       ] = invoiceData;
//       //   return;
//     } else {
//       customer.subscriptions[existingSubscriptionIndex].invoice.push(
//         invoiceData
//       );
//     }
//     let credits;
//     switch (priceId) {
//       case "price_1QkKUWFRpxCUo2PA0IBMb8Tk":
//         credits = 1000;
//         break;
//       case "price_1QmYTXFRpxCUo2PAFt5uOEWY":
//         credits = 10000;
//         break;

//       default:
//         break;
//     }

//     if (!findUserData) {
//       console.log("user data not found");
//       await userData.create({
//         email: customerEmail,
//         credits: credits,
//         isPro: true,
//         priceId: priceId,
//         period: {
//           start: invoiceData.period.start, // Convert from Unix timestamp
//           end: invoiceData.period.end,
//         },
//       });
//     } else {
//       await userData.updateOne(
//         { email: customerEmail },
//         {
//           credits: credits,
//           isPro: true,
//           priceId: priceId,
//           period: {
//             start: invoiceData.period.start, // Convert from Unix timestamp
//             end: invoiceData.period.end,
//           },
//         }
//       );
//     }

//     // Save the updated customer document to the database
//     await customer.save();
//     console.log(
//       "Invoice data updated successfully:",
//       customer.subscriptions[existingSubscriptionIndex]
//     );
//   } catch (error) {
//     console.error("Error handling invoice update:", error.message);
//     console.error("Stack trace:", error.stack);
//   }
// };

async function getSubscriptionsByCustomer(customerId) {
  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
  });

  return subscriptions.data;
}

// export const handleInvoice = async (
//   stripeId,
//   customerEmail,
//   priceId,
//   invoiceData
// ) => {
//   try {
//     if (!stripeId || !invoiceData) {
//       throw new Error("Missing stripeId or invoiceData.");
//     }

//     // Find the customer in the database by Stripe ID
//     let customer = await Customer.findOne({ stripeId });
//     let subscriptions = await Subscription.findOne({ stripeId });
//     let user = await User.findOne({ email: customerEmail });
//     const findUserData = await userData.findOne({ email: customerEmail });
//     console.log("Invoice data received:", invoiceData);

//     if (!customer || !user) {
//       console.warn(
//         `Customer or user not found for stripeId ${stripeId} or customerEmail ${customerEmail}.`
//       );
//       return;
//     }

//     // Retry mechanism to find the existing subscription by subscriptionId
//     // const existingSubscriptionIndex = await retryWithExponentialBackoff(
//     //   async () => {
//     //     const index = customer.subscriptions.findIndex(
//     //       (sub) => sub.subscriptionId === invoiceData.subscription
//     //     );

//     //     if (index === -1) {
//     //       throw new Error("Subscription not found. Retrying....");
//     //     }

//     //     return index;
//     //   }
//     // );

//     const currentSubscription = subscriptions.find(
//       (sub) => sub.subscriptionId === invoiceData.subscription
//     );

//     const customerSubscriptions = await getSubscriptionsByCustomer(stripeId);

//     // const fetchSubscriptions = customerSubscriptions.map((subscriptionData) => {
//     //   // console.log("subscriptionData111111111", subscriptionData);
//     //   if (subscriptionData.id !== currentSubscription.subscriptionId) {
//     //     // console.log("fetch0000Data123", subscriptionData.id);
//     //     const subscriptionId = subscriptionData.id;
//     //     return subscriptionId;
//     //   }
//     // });

//     const fetchSubscriptions = customerSubscriptions
//       .filter((sub) => sub.id !== currentSubscription.subscriptionId)
//       .map((sub) => sub.id);

//     await Promise.all(
//       fetchSubscriptions.map((subscriptionId) =>
//         stripe.subscriptions.update(subscriptionId, {
//           cancel_at_period_end: true,
//         })
//       )
//     );

//     const againcustomerSubscriptions = await getSubscriptionsByCustomer(
//       stripeId
//     );
//     let customerInDb = await Customer.findOne({
//       stripeId,
//     });
//     if (!customerInDb) {
//       console.error("Customer not found!");
//       return;
//     }

//     // Loop through customer subscriptions and update the necessary fields
//     subscriptions.map((subscription, index) => {
//       const foundSubData = againcustomerSubscriptions.find(
//         (custSubData) => custSubData.id === subscription.subscriptionId
//       );

//       if (!foundSubData) {
//         console.warn(
//           `No matching subscription found for subscriptionId: ${subscription.subscriptionId}`
//         );
//         return; // Skip iteration if no match is found
//       }

//       customerInDb.set(`subscriptions.${index}`, {
//         ...subscription,
//         cancel_at: foundSubData.cancel_at
//           ? new Date(foundSubData.cancel_at * 1000)
//           : null,
//         cancel_at_period_end: foundSubData.cancel_at_period_end,
//         canceled_at: foundSubData.canceled_at
//           ? new Date(foundSubData.canceled_at * 1000)
//           : null,
//       });
//     });

//     // Save only once after all updates
//     await customerInDb.save();

//     let currentSubscriptionIndex = -1;
//     if (currentSubscription.invoice) {
//       currentSubscriptionIndex = currentSubscription.invoice.findIndex(
//         (invoice) => invoice.invoice_id === invoiceData.invoice_id
//       );
//     }

//     if (currentSubscriptionIndex !== -1) {
//       customer.subscriptions[existingSubscriptionIndex].invoice[
//         currentSubscriptionIndex
//       ] = invoiceData;
//       console.log("Updated existing invoice.");
//     } else {
//       customer.subscriptions[existingSubscriptionIndex].invoice.push(
//         invoiceData
//       );
//       console.log("Pushed new invoice to the array.");
//     }

//     let credits;
//     switch (priceId) {
//       case "price_1QkKUWFRpxCUo2PA0IBMb8Tk":
//         credits = 1000;
//         break;
//       case "price_1QmYTXFRpxCUo2PAFt5uOEWY":
//         credits = 10000;
//         break;

//       default:
//         break;
//     }

//     if (!findUserData) {
//       console.log("user data not found. creating new user...");
//       await userData.create({
//         email: customerEmail,
//         credits: credits,
//         isPro: true,
//         priceId: priceId,
//         period: {
//           start: invoiceData.period.start, // Convert from Unix timestamp
//           end: invoiceData.period.end,
//         },
//       });
//     } else {
//       await userData.updateOne(
//         { email: customerEmail },
//         {
//           credits: credits,
//           isPro: true,
//           priceId: priceId,
//           period: {
//             start: invoiceData.period.start, // Convert from Unix timestamp
//             end: invoiceData.period.end,
//           },
//         }
//       );
//     }

//     // Log the customer subscriptions before saving
//     console.log(
//       "Customer subscriptions before save:",
//       customer.subscriptions[existingSubscriptionIndex]
//     );

//     // Save the updated customer document to the database
//     await customer.save();
//     console.log("Customer saved successfully:", customer);
//   } catch (error) {
//     console.error("Error handling invoice update:", error.message);
//     console.error("Stack trace:", error.stack);
//   }
// };
let createdUser;
const firebaseUID1 = "firebase_customer_123"; // 👈 custom _id
const firebaseUID = "firebase_user_123"; // 👈 custom _id
const firebaseUID2 = "firebase_invoice_123"; // 👈 custom _id
export const handleInvoice = async (customerId, invoiceData) => {
  try {
    let existingInvoice = await Invoice.findOne({ customerId });

    if (!existingInvoice) {
      const newInvoice = new Invoice({
        _id: firebaseUID2,
        // customer: firebaseUID1,
        // subscription: firebaseUID,
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
  } catch (error) {
    console.error("Error storing invoice:", error.message);
  }
};

const getCustomerWithSubscriptions = async (customerEmail) => {
  try {
    // Find customer by email
    const customer = await Customer.findOne({ email: customerEmail });
    if (!customer) {
      console.log("Customer not found");
      return null;
    }

    // Find subscriptions matching the customer's stripeId
    const subscription = await Subscription.findOne({
      stripeId: customer.stripeId,
    });

    // Merge customer and subscription data
    return {
      ...customer.toObject(),
      subscriptions: subscription ? subscription.subscriptions : [],
    };
  } catch (error) {
    console.error("Error fetching customer and subscriptions:", error);
  }
};

// Example Usage
// getCustomerWithSubscriptions("example7@mailinator.com").then(console.log);

export const handleCheckoutSessionCompleted = async (userId, session) => {
  try {
    const stripeId = session.customer; // Stripe customer ID
    const email = session.metadata.userEmail; // Customer's email from Stripe

    if (!userId || !stripeId || !email) {
      throw new Error("Missing required session metadata or customer details.");
    }

    // Check if the user already exists in the database
    const customer = await Customer.findById(userId);
    console.log("customer", customer);

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
        // user: firebaseUID,
        email,
        stripeId,
        subscription: firebaseUID,
      });
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
    // const customer = await Customer.findOne({ stripeId });
    console.log("customer dound", createdUser);

    if (!stripeId || !updatedSubscriptionData) {
      throw new Error("Missing stripeId or updatedSubscriptionData.");
    }

    // Find the subscription document for this customer
    let existingSubscriptionDoc = await Subscription.findOne({ stripeId });
    console.log("existingSubscriptionDoc", existingSubscriptionDoc);

    if (!existingSubscriptionDoc) {
      console.log("enter !existingSubscriptionDoc block");

      // If no document exists, create a new one with subscriptions as an array
      await Subscription.create({
        _id: firebaseUID,
        // customer: firebaseUID1,

        stripeId,
        subscriptions: [updatedSubscriptionData], // Store subscriptions in an array
        invoice: firebaseUID2,
      });

      console.log("Created new subscription document for the customer.");
      return;
    }

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
      existingSubscriptionDoc.subscriptions.push(updatedSubscriptionData);
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

const retryWithExponentialBackoff = async (
  fn,
  retries = 5,
  initialDelay = 1000
) => {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) {
      console.error("Max retries reached. Throwing error:", error.message);
      throw error; // No more retries left
    }

    console.warn(
      `Retry attempt remaining: ${retries}, Retrying in ${initialDelay}ms...`
    );
    await delay(initialDelay); // Wait before retrying
    return retryWithExponentialBackoff(fn, retries - 1, initialDelay * 2); // Retry with exponential backoff
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
        created: subscription.created ? new Date(subscription.created) : null,
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
      handleInvoice(invoice.customer, invoiceData);

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
