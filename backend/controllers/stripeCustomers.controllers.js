import Stripe from "stripe";

// Initialize the Stripe instance with your secret key
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const stripe = new Stripe(
  "sk_test_51Otnl4DPA0JjYlhgNqTQRCW2NiDMP5chcNp8lURw0NapSlEyYA2PGO5TUkwrWsy2qqvp0qVHnmmt2Nie6NEUd1Aw00VeWD2cYi"
);

export const getCustomers = async (req, res) => {
  try {
    const customers = await stripe.customers.list({ limit: 10 });
    res.status(200).json({ success: true, data: customers });
    console.log("Customers:", customers.data);
  } catch (error) {
    res.status(500).json({ success: false, message: error });
    console.error("Error fetching customers:", error);
  }
};
