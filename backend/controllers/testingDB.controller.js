import Customer from "../models/customer.models.js";
import Invoice from "../models/invoice.models.js";
import Subscription from "../models/subscription.models.js";
import User from "../models/user.models.js";
import userData from "../models/userData.models.js";
import Stripe from "stripe";
const stripe = new Stripe(
  "sk_test_51QkKNSFRpxCUo2PABo52EiZ1cCFV3wl5JZLRqnbqfGJOrfMi4KZ21ijcQpWbrsxM3aKSwxHOz3elWWMRVjijsMdb00IUrffgj2"
);
const subscriptions222 = [
  {
    subscriptionId: "sub_1QpTrrFRpxCUo2PAfinOhx4M",

    ended_at: null,
    invoice: [Array],
  },
  {
    subscriptionId: "sub_1Qpl6xFRpxCUo2PAEE9T9t0e",

    ended_at: null,
    invoice: [Array],
  },
  {
    subscriptionId: "sub_1QplMXFRpxCUo2PAbNcIkh4s",

    ended_at: null,
    invoice: [Array],
  },
  {
    subscriptionId: "sub_1QplMXFRpxCUo2PAbNcIkh4s",

    ended_at: null,
    invoice: [],
  },
  {
    subscriptionId: "sub_1QplVOFRpxCUo2PAqCrTQQ4t",

    ended_at: null,
    invoice: [Array],
  },
  {
    subscriptionId: "sub_1QplVOFRpxCUo2PAqCrTQQ4t",

    ended_at: null,
    invoice: [],
  },
  {
    subscriptionId: "sub_1QpqunFRpxCUo2PAKZKELxkw",

    ended_at: null,
    invoice: [],
  },
  {
    subscriptionId: "sub_1QpqunFRpxCUo2PAKZKELxkw",

    ended_at: null,
    invoice: [],
  },
  {
    subscriptionId: "sub_1QpqvtFRpxCUo2PAi0Zn3IHU",

    ended_at: null,
    invoice: [],
  },
  {
    subscriptionId: "sub_1Qpqy0FRpxCUo2PAcXhTpAhP",

    ended_at: null,
    invoice: [],
  },
  {
    subscriptionId: "sub_1Qpr19FRpxCUo2PAEMx4Eqaw",

    ended_at: null,
    invoice: [],
  },
  {
    subscriptionId: "sub_1Qpr19FRpxCUo2PAEMx4Eqaw",

    ended_at: null,
    invoice: [],
  },
  {
    subscriptionId: "sub_1QprBmFRpxCUo2PA2d6TY7So",

    ended_at: null,
    invoice: [Array],
  },
  {
    subscriptionId: "sub_1QprBmFRpxCUo2PA2d6TY7So",

    ended_at: null,
    invoice: [],
  },
  {
    subscriptionId: "sub_1QprH0FRpxCUo2PAgIDwf8E9",

    ended_at: null,
    invoice: [Array],
  },
  {
    subscriptionId: "sub_1QprH0FRpxCUo2PAgIDwf8E9",

    ended_at: null,
    invoice: [],
  },
  {
    subscriptionId: "sub_1QqpzIFRpxCUo2PA8S7wQ5Va",

    ended_at: null,
    invoice: [Array],
  },
  {
    subscriptionId: "sub_1QqpzIFRpxCUo2PA8S7wQ5Va",

    ended_at: null,
    invoice: [],
  },
  {
    subscriptionId: "sub_1QqqzIFRpxCUo2PADfnMKQDH",

    ended_at: null,
    invoice: [],
  },
];

async function getSubscriptionsByCustomer(customerId) {
  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
  });

  return subscriptions.data;
}

export const handleInvoice = async (stripeId, customerEmail, invoiceData) => {
  try {
    if (!stripeId || !invoiceData) {
      throw new Error("Missing stripeId or invoiceData.");
    }

    // Find the customer in the database by Stripe ID
    // let customer = await Customer.findOne({ stripeId });
    let subscriptions = await Subscription.find();
    let invoices = await Invoice.findOne();
    let user = await User.findOne({ email: customerEmail });
    const findUserData = await userData.findOne({ email: customerEmail });
    // console.log("findUserData", findUserData);

    // console.log("Invoice data received:", invoiceData);
    if (!user) {
      console.warn(`user not found for email ${customerEmail}.`);
      return;
    }
    // if (!customer) {
    //   console.warn(`Customer not found for stripeId ${stripeId}.`);
    //   return;
    // }

    // console.log("Customer found:", customer);
    // console.log("User found:", user);

    // Find the existing subscription by subscriptionId
    const existingSubscriptionIndex = subscriptions.findIndex(
      (sub) => sub.subscriptionId === invoiceData.subscription
    );
    const currentSubscription = subscriptions.find(
      (sub) => sub.subscriptionId === invoiceData.subscription
    );
    // console.log("currentSubscription", currentSubscription);

    const customerSubscriptions = await getSubscriptionsByCustomer(
      "cus_RjDYFEZcodeimU"
    );
    // console.log("customerSubscriptions", customerSubscriptions);

    const fetchSubscriptions = customerSubscriptions.map((subscriptionData) => {
      // console.log("subscriptionData111111111", subscriptionData);
      if (subscriptionData.id !== currentSubscription.subscriptionId) {
        // console.log("fetch0000Data123", subscriptionData.id);
        const subscriptionId = subscriptionData.id;
        return subscriptionId;
      }
    });
    // console.log("fetchSubscriptions123", fetchSubscriptions);
    // console.log("currentSubscription.invoice", currentSubscription.invoice);
    // Set your secret key. Remember to switch to your live secret key in production.
    // See your keys here: https://dashboard.stripe.com/apikeys
    // Set your secret key. Remember to switch to your live secret key in production.
    // See your keys here: https://dashboard.stripe.com/apikeys

    fetchSubscriptions.map(
      async (subscriptionId) =>
        await stripe.subscriptions.update(subscriptionId, {
          cancel_at_period_end: true,
        })
    );

    const againcustomerSubscriptions = await getSubscriptionsByCustomer(
      "cus_RjDYFEZcodeimU"
    );
    // console.log("againcustomerSubscriptions", againcustomerSubscriptions);
    let subscriptionInDb = await Subscription.findOne({
      stripeId: "cus_RjDYFEZcodeimU",
    });
    if (!subscriptionInDb) {
      console.error("Customer not found!");
      return;
    }

    // Loop through customer subscriptions and update the necessary fields
    subscriptionInDb.map((subscription, index) => {
      const foundSubData = againcustomerSubscriptions.find(
        (custSubData) => custSubData.id === subscription.subscriptionId
      );
      console.log("foundSubData======", foundSubData);

      console.log("Checking subscriptionId:", subscription.subscriptionId);
      // console.log("Found subscription data:", foundSubData);

      if (!foundSubData) {
        console.warn(
          `No matching subscription found for subscriptionId: ${subscription.subscriptionId}`
        );
        return; // Skip iteration if no match is found
      }

      subscriptionInDb.set(`subscriptions.${index}`, {
        ...subscription,
        cancel_at: foundSubData.cancel_at
          ? new Date(foundSubData.cancel_at * 1000)
          : null,
        cancel_at_period_end: foundSubData.cancel_at_period_end,
        canceled_at: foundSubData.canceled_at
          ? new Date(foundSubData.canceled_at * 1000)
          : null,
      });
    });

    // Save only once after all updates
    await subscriptionInDb.save();
    console.log("Subscriptions updated successfully!");

    let currentSubscriptionIndex = -1;
    if (currentSubscription.invoice) {
      currentSubscriptionIndex = currentSubscription.invoice.findIndex(
        (invoice) => invoice.invoice_id === invoiceData.invoice_id
      );
    }

    // console.log("currentSubscription", currentSubscription);
    // console.log("currentSubscriptionIndex", currentSubscriptionIndex);

    // console.log(
    //   "Existing subscription index invoice:",
    //   existingSubscriptionIndex
    // );
    await invoices.create(invoiceData);
    // const existingInvoice =
    //   customer.subscriptions[existingSubscriptionIndex].invoice[
    //     currentSubscriptionIndex
    //   ];
    // // console.log("existingInvoice:", existingInvoice);
    // if (currentSubscriptionIndex !== -1) {
    //   customer.subscriptions[existingSubscriptionIndex].invoice[
    //     currentSubscriptionIndex
    //   ] = invoiceData;
    //   //   return;
    // } else {
    //   customer.subscriptions[existingSubscriptionIndex].invoice.push(
    //     invoiceData
    //   );
    // }
    // await user.updateOne({ $set: { credits: 1000 } });

    if (!findUserData) {
      console.log("user data not found");
      await userData.create({
        email: "newdedara12345refrencing@mailinator.com",
        credits: 1000,
        isPro: true,
        priceId: "price_1QkKUWFRpxCUo2PA0IBMb8Tk",
      });
    } else {
      // console.log("updating user data....", await userData.find());
      const allUsers = await userData.find(); // This will retrieve all users
      const findCurrentUserIndex = await allUsers.findIndex(
        (user) => user.email === "newdedara12345refrencing@mailinator.com"
      );
      console.log("here999..............", findCurrentUserIndex);

      await userData.updateOne(
        { email: "newdedara12345refrencing@mailinator.com" },
        {
          credits: 1300,
          isPro: true,
          priceId: "price_1QkKUWFRpxCUo2PA0IBMb8Tk",
        }
      );
      // await userData.save();
    }
    // Save the updated customer document to the database
    // await customer.save();
    // await user.save();
    // console.log(
    //   "Invoice data updated successfully:",
    //   customer.subscriptions[existingSubscriptionIndex]
    // );
  } catch (error) {
    console.error("Error handling invoice update:", error.message);
    console.error("Stack trace:", error.stack);
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

    // Find the customer in the database by Stripe ID
    let customer = await Customer.findOne({ stripeId });
    let subscriptions = await Subscription.find();

    if (!customer) {
      console.warn(`Customer not found for Stripe ID: ${stripeId}`);
      // Handle retry logic or temporary storage for missing customers here if needed
      return;
    }

    // Find the subscription with the same subscriptionId
    let existingSubscription = await Subscription.findOne({
      stripeId,
      "subscription.subscriptionId": updatedSubscriptionData.subscriptionId,
    });

    if (existingSubscription) {
      // Update existing subscription fields
      existingSubscription.subscription = {
        ...existingSubscription.subscription, // Keep existing data
        ...updatedSubscriptionData, // Overwrite with new data
      };

      // Save the updated subscription
      await existingSubscription.save();

      console.log(
        `Updated existing subscription for ${stripeId}:`,
        existingSubscription
      );
    } else {
      // Add a new subscription if it doesn't exist
      await Subscription.create({
        stripeId,
        subscription: updatedSubscriptionData,
      });
      console.log("Added new subscription to the customer.", subscriptions);
    }

    // Save the updated customer document to the database
    // await subscriptions.save();
    console.log("Customer subscription updated successfully.", subscriptions);
  } catch (error) {
    console.error(
      "Error handling customer subscription update:",
      error.message
    );
    console.error("Stack trace:", error.stack);
  }
};

export const testingDB = async () => {
  console.log("teting db");
  const customer = await Customer.findById("dedara2345");
  if (!customer) {
    await Customer.create({
      _id: "dedara2345",
      email: "newdedara12345refrencing@mailinator.com",
      stripeId: "cus_RfSUBddWeaaOjd",
    });
    // if (!customer) {
    //   throw new Error("Customer creation failed. Received null response.");
    // }

    // console.log("New customer created:", customer);
    // return;
  } else {
    // console.log("Customer found in the database:", customer);
  }
  //   console.log("New customer created outside:", customer);

  await customer?.save();
  console.log("Customer saved successfully.", customer);
  //   return;
  const stripeId = "cus_RfSUBddWeaaOjd";
  const dummySubscriptionData1 = {
    subscriptionId: "sub_3Qm7ZLFRpxCUo2PAwMhYaZXX",
    cancel_at: new Date(1625707230 * 1000),
    cancel_at_period_end: true,
    canceled_at: new Date(1625707230 * 1000),
    created: new Date(1625707230 * 1000),
    current_period_end: new Date(1731043150 * 1000),
    current_period_start: new Date(1625707230 * 1000),
    ended_at: null,
  };

  //   console.log("Testing subscription update with data:", dummySubscriptionData1);

  await handleCustomerSubscriptionUpdated(stripeId, dummySubscriptionData1);
  // const invoiceCustomer = "cus_RfSUBddWeaaOjd";
  // const invoiceData = {
  //   invoice_id: "in_1QiCozDPA0JjYlhgoYS3xxtQ",
  //   amount_due: 999,
  //   amount_paid: 999,
  //   currency: "usd",
  //   customer: "cus_RfSUBddWeaaOjd",
  //   period: {
  //     start: new Date(1738043102 * 1000), // Convert from Unix timestamp
  //     end: new Date(1738043120 * 1000),
  //   },
  //   subscription: "sub_1Qm7ZLFRpxCUo2PAwMhYaZXX",
  // };
  // const customerEmail = "newdedara12345refrencing@mailinator.com";
  // await handleInvoice(invoiceCustomer, customerEmail, invoiceData);

  // Reload the customer to check updated data
  //   const updatedCustomer = await Customer.findById(customer._id);
  //   console.log("Updated customer data:", updatedCustomer);
};
