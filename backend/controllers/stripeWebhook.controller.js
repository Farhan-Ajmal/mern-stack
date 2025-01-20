import Stripe from "stripe";
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const stripe = new Stripe(
  "sk_test_51Otnl4DPA0JjYlhgNqTQRCW2NiDMP5chcNp8lURw0NapSlEyYA2PGO5TUkwrWsy2qqvp0qVHnmmt2Nie6NEUd1Aw00VeWD2cYi"
);

export const getRealtimeData = async (request, response) => {
  let event = request.body;

  const endpointSecret =
    "whsec_015be206619cfd9a3b57daf7ba0f3906c48ddfef2444aeddb00933e40b0d694e";

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

  switch (event.type) {
    case "customer.subscription.created":
      subscription = event.data.object;
      status = subscription.status;
      console.log(`Subscription created with status: ${status}`);
      break;

    case "customer.subscription.updated":
      subscription = event.data.object;
      status = subscription.status;
      console.log(`Subscription updated. New status: ${status}`);
      break;

    case "invoice.payment_succeeded":
      const invoice = event.data.object;
      console.log(`Invoice payment succeeded for invoice: ${invoice.id}`);
      console.log(`invoice data: ${invoice}`);
      console.log(
        `Formatted Invoice payment data: ${JSON.stringify(invoice, null, 2)}`
      );
      break;

    case "invoice.payment_failed":
      console.log("Invoice payment failed.");
      break;

    case "payment_intent.succeeded":
      const paymentIntent = event.data.object;
      console.log(`PaymentIntent succeeded: ${paymentIntent.id}`);
      console.log(`PaymentIntent data: ${paymentIntent}`);
      console.log(
        `Formatted PaymentIntent data: ${JSON.stringify(
          paymentIntent,
          null,
          2
        )}`
      );
      break;

    case "payment_intent.created":
      console.log("PaymentIntent created.");
      break;

    case "checkout.session.completed":
      const session = event.data.object;
      console.log("Checkout session completed:", session);
      break;

    default:
      console.log(`Unhandled event type ${event.type}.`);
  }

  response.send();
};
