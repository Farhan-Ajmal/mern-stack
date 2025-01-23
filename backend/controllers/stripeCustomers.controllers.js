import Stripe from "stripe";

// Initialize the Stripe instance with your secret key
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const stripe = new Stripe(
  "sk_test_51QkKNSFRpxCUo2PABo52EiZ1cCFV3wl5JZLRqnbqfGJOrfMi4KZ21ijcQpWbrsxM3aKSwxHOz3elWWMRVjijsMdb00IUrffgj2"
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
