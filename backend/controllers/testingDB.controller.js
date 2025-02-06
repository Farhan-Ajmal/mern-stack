import Customer from "../models/customer.models.js";
import User from "../models/user.models.js";
import userData from "../models/userData.models.js";

export const handleInvoice = async (stripeId, customerEmail, invoiceData) => {
  try {
    if (!stripeId || !invoiceData) {
      throw new Error("Missing stripeId or invoiceData.");
    }

    // Find the customer in the database by Stripe ID
    let customer = await Customer.findOne({ stripeId });
    let user = await User.findOne({ email: customerEmail });
    const findUserData = await userData.findOne({ email: customerEmail });
    console.log("findUserData", findUserData);

    console.log("Invoice data received:", invoiceData);
    if (!user) {
      console.warn(`user not found for email ${customerEmail}.`);
      return;
    }
    if (!customer) {
      console.warn(`Customer not found for stripeId ${stripeId}.`);
      return;
    }

    console.log("Customer found:", customer);
    console.log("User found:", user);

    // Find the existing subscription by subscriptionId
    const existingSubscriptionIndex = customer.subscriptions.findIndex(
      (sub) => sub.subscriptionId === invoiceData.subscription
    );
    const currentSubscription = customer.subscriptions.find(
      (sub) => sub.subscriptionId === invoiceData.subscription
    );
    console.log("currentSubscription.invoice", currentSubscription.invoice);

    let currentSubscriptionIndex = -1;
    if (currentSubscription.invoice) {
      currentSubscriptionIndex = currentSubscription.invoice.findIndex(
        (invoice) => invoice.invoice_id === invoiceData.invoice_id
      );
    }

    console.log("currentSubscription", currentSubscription);
    console.log("currentSubscriptionIndex", currentSubscriptionIndex);

    console.log(
      "Existing subscription index invoice:",
      existingSubscriptionIndex
    );

    const existingInvoice =
      customer.subscriptions[existingSubscriptionIndex].invoice[
        currentSubscriptionIndex
      ];
    console.log("existingInvoice:", existingInvoice);
    if (currentSubscriptionIndex !== -1) {
      customer.subscriptions[existingSubscriptionIndex].invoice[
        currentSubscriptionIndex
      ] = invoiceData;
      //   return;
    } else {
      customer.subscriptions[existingSubscriptionIndex].invoice.push(
        invoiceData
      );
    }
    // await user.updateOne({ $set: { credits: 1000 } });

    if (!findUserData) {
      console.log("user data not found");
      await userData.create({
        email: "dedara12345@mailinator.com",
        credits: 1000,
        isPro: true,
        priceId: "price_1QkKUWFRpxCUo2PA0IBMb8Tk",
      });
    } else {
      console.log("updating user data....", await userData.find());
      const allUsers = await userData.find(); // This will retrieve all users
      const findCurrentUserIndex = await allUsers.findIndex(
        (user) => user.email === "dedara12345@mailinator.com"
      );
      console.log("here999..............", findCurrentUserIndex);

      await userData.updateOne(
        { email: "dedara12345@mailinator.com" },
        {
          credits: 1300,
          isPro: true,
          priceId: "price_1QkKUWFRpxCUo2PA0IBMb8Tk",
        }
      );
      // await userData.save();
    }
    // Save the updated customer document to the database
    await customer.save();
    // await user.save();
    console.log(
      "Invoice data updated successfully:",
      customer.subscriptions[existingSubscriptionIndex]
    );
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

    if (!customer) {
      console.warn(`Customer not found for Stripe ID: ${stripeId}`);
      // Handle retry logic or temporary storage for missing customers here if needed
      return;
    }

    // Find the existing subscription by subscriptionId
    const existingSubscriptionIndex = customer.subscriptions.findIndex(
      (sub) => sub.subscriptionId === updatedSubscriptionData.subscriptionId
    );
    console.log("existingSubscriptionIndex", existingSubscriptionIndex);

    if (existingSubscriptionIndex !== -1) {
      // Update the existing subscription
      customer.subscriptions[existingSubscriptionIndex] = {
        ...customer.subscriptions[existingSubscriptionIndex],
        ...updatedSubscriptionData,
        invoice: customer.subscriptions[existingSubscriptionIndex].invoice, // Retain the existing invoice array
      };
      console.log(
        `Updated existing subscription at index ${existingSubscriptionIndex}.`
      );
    } else {
      // Add a new subscription if it doesn't exist
      customer.subscriptions.push(updatedSubscriptionData);
      console.log("Added new subscription to the customer.");
    }

    // Save the updated customer document to the database
    await customer.save();
    console.log("Customer subscription updated successfully.", customer);
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
      email: "dedara12345@mailinator.com",
      stripeId: "cus_RfSUBddWeaaOjd",
      subscriptions: [],
    });
    // if (!customer) {
    //   throw new Error("Customer creation failed. Received null response.");
    // }

    console.log("New customer created:", customer);
    // return;
  } else {
    console.log("Customer found in the database:", customer);
  }
  //   console.log("New customer created outside:", customer);

  await customer?.save();
  console.log("Customer saved successfully.", customer);
  //   return;
  const stripeId = "cus_RfSUBddWeaaOjd";
  const dummySubscriptionData1 = {
    subscriptionId: "sub_1Qm7ZLFRpxCUo2PAwMhYaZXX",
    cancel_at: new Date(2738043202 * 1000),
    cancel_at_period_end: false,
    canceled_at: new Date(2738043202 * 1000),
    created: new Date(2738043202 * 1000),
    current_period_end: new Date(1738043150 * 1000),
    current_period_start: new Date(2738043202 * 1000),
    ended_at: null,
  };

  //   console.log("Testing subscription update with data:", dummySubscriptionData1);

  await handleCustomerSubscriptionUpdated(stripeId, dummySubscriptionData1);
  const invoiceCustomer = "cus_RfSUBddWeaaOjd";
  const invoiceData = {
    invoice_id: "in_1QiCozDPA0JjYlhgoYS3xxtQ",
    amount_due: 999,
    amount_paid: 999,
    currency: "usd",
    customer: "cus_RfSUBddWeaaOjd",
    period: {
      start: new Date(1738043102 * 1000), // Convert from Unix timestamp
      end: new Date(1738043120 * 1000),
    },
    subscription: "sub_1Qm7ZLFRpxCUo2PAwMhYaZXX",
  };
  const customerEmail = "dedara12345@mailinator.com";
  await handleInvoice(invoiceCustomer, customerEmail, invoiceData);

  // Reload the customer to check updated data
  //   const updatedCustomer = await Customer.findById(customer._id);
  //   console.log("Updated customer data:", updatedCustomer);
};
