import Stripe from "stripe";

const stripe = new Stripe(
  "sk_test_51QkKNSFRpxCUo2PABo52EiZ1cCFV3wl5JZLRqnbqfGJOrfMi4KZ21ijcQpWbrsxM3aKSwxHOz3elWWMRVjijsMdb00IUrffgj2"
);

export const subscribeUser = async (req, res) => {
  const { plan } = req.body; // Use req.body instead of req.query

  if (!plan) {
    return res.status(400).send("Subscription plan not found");
  }

  let priceId;

  switch (plan.toLowerCase()) {
    case "starter":
      priceId = "price_1QkKUWFRpxCUo2PA0IBMb8Tk"; // Replace with your actual Stripe Price ID for the Starter plan
      break;

    case "pro":
      priceId = "your_price_id_pro"; // Replace with your actual Stripe Price ID for the Pro plan
      break;

    default:
      return res.status(400).send("Subscription plan not found");
  }

  try {
    let customer;
    let customer_id;
    customer = await stripe.customers.list({
      email: "example5@mailinator.com",
    });

    if (customer.data.length === 0) {
      customer = await stripe.customers.create({
        email: "example5@mailinator.com",
      });
      customer_id = customer.id;
    } else {
      customer_id = customer.data[0].id;
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `http://localhost:5001/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `http://localhost:5001/cancel`,
      // customer_email: "example5@mailinator.com",
      customer: customer_id,
      metadata: {
        userEmail: "example5@mailinator.com",
        userId: "example52345", // Store the logged-in user's ID
      },
    });
    res.status(200).json({ success: true, url: session.url }); // Send the Stripe Checkout URL as a response
  } catch (error) {
    console.error("Error creating Stripe session:", error.message);
    res.status(500).send("Internal Server Error");
  }
};
