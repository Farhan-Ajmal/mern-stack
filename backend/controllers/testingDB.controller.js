import Customer from "../models/customer.models.js";
export const handleInvoice = async (stripeId, invoiceData) => {
  try {
    if (!stripeId || !invoiceData) {
      throw new Error("Missing stripeId or invoiceData.");
    }

    // Find the customer in the database by Stripe ID
    let customer = await Customer.findOne({ stripeId });
    console.log("Invoice data received:", invoiceData);

    if (!customer) {
      console.warn(`Customer not found for stripeId ${stripeId}.`);
      return;
    }

    console.log("Customer found:", customer);

    // Find the existing subscription by subscriptionId
    const existingSubscriptionIndex = customer.subscriptions.findIndex(
      (sub) => sub.subscriptionId === invoiceData.subscription
    );

    console.log("Existing subscription index invoice:", existingSubscriptionIndex);

    if (existingSubscriptionIndex === -1) {
      console.warn(
        `No subscription found for subscriptionId ${invoiceData.subscription}.`
      );
      return;
    }

    const existingSubscription =
      customer.subscriptions[existingSubscriptionIndex];
    console.log("Existing subscription:", existingSubscription);

    // Ensure the `invoice` field is an array
    if (!Array.isArray(existingSubscription.invoice)) {
      console.warn(
        "Invoice field is not an array. Initializing as an empty array."
      );
      existingSubscription.invoice = [];
    }

    // Add the new invoice to the array
    existingSubscription.invoice.push(invoiceData);

    // Save the updated customer document to the database
    await customer.save();
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

    console.log("Processing subscription update for Stripe ID:", stripeId);
    console.log("Updated subscription data:", updatedSubscriptionData);

    // Find the customer in the database by Stripe ID
    let customer = await Customer.findOne({ stripeId });

    if (!customer) {
      console.warn(`Customer not found for Stripe ID: ${stripeId}`);
      // Handle retry logic or temporary storage for missing customers here if needed
      return;
    }

    console.log("Customer found:", customer);

    // Find the existing subscription by subscriptionId
    const existingSubscriptionIndex = customer.subscriptions.findIndex(
      (sub) => sub.subscriptionId === updatedSubscriptionData.subscriptionId
    );
    console.log(
      "below cus found",
      customer.subscriptions[existingSubscriptionIndex]
    );

    console.log(
      "customer.subscriptions[existingSubscriptionIndex].invoice",
      customer.subscriptions[existingSubscriptionIndex].invoice
    );

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
  const customer = await Customer.findById("dedara23");
  if (!customer) {
    await Customer.create({
      _id: "dedara23",
      email: "dedara@mailinator.com",
      stripeId: "cus_RfSUBddWeaaOjc",
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
  const stripeId = "cus_RfSUBddWeaaOjc";
  const dummySubscriptionData1 = {
    subscriptionId: "sub_1Qm7ZLFRpxCUo2PAwMhYaZKk",
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
  const invoiceCustomer = "cus_RfSUBddWeaaOjc";
  const invoiceData = {
    invoice_id: "in_1QiCozDPA0JjYlhgoYS3mmtQ",
    amount_due: 999,
    amount_paid: 999,
    currency: "usd",
    customer: "cus_RfSUBddWeaaOjc",
    period: {
      start: new Date(1738043102 * 1000), // Convert from Unix timestamp
      end: new Date(1738043120 * 1000),
    },
    subscription: "sub_1Qm7ZLFRpxCUo2PAwMhYaZKk",
  };

  await handleInvoice(invoiceCustomer, invoiceData);

  // Reload the customer to check updated data
  //   const updatedCustomer = await Customer.findById(customer._id);
  //   console.log("Updated customer data:", updatedCustomer);
};
