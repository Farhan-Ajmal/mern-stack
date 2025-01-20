import Stripe from "stripe";

const stripe = new Stripe(
  "sk_test_51Otnl4DPA0JjYlhgNqTQRCW2NiDMP5chcNp8lURw0NapSlEyYA2PGO5TUkwrWsy2qqvp0qVHnmmt2Nie6NEUd1Aw00VeWD2cYi"
);

export const subscribeUser = async (req, res) => {
  const { plan } = req.body; // Use req.body instead of req.query

  if (!plan) {
    return res.status(400).send("Subscription plan not found");
  }

  let priceId;

  switch (plan.toLowerCase()) {
    case "starter":
      priceId = "price_1P9TVmDPA0JjYlhg79nAtNeG"; // Replace with your actual Stripe Price ID for the Starter plan
      break;

    case "pro":
      priceId = "your_price_id_pro"; // Replace with your actual Stripe Price ID for the Pro plan
      break;

    default:
      return res.status(400).send("Subscription plan not found");
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `http://localhost:5000/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `http://localhost:5000/cancel`,
      customer_email: "raccoonfarhan0349@gmail.com",
      metadata: {
        userId: "userId", // Store the logged-in user's ID
      },
    });
    res.status(200).json({ success: true, url: session.url }); // Send the Stripe Checkout URL as a response
  } catch (error) {
    console.error("Error creating Stripe session:", error.message);
    res.status(500).send("Internal Server Error");
  }
};
