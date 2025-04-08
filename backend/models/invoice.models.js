import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema({
  customer: { type: String, required: true },
  invoices: [
    {
      invoice_id: { type: String, required: true }, // Unique identifier for each invoice
      amount_due: { type: Number, required: true },
      amount_paid: { type: Number, required: true },
      currency: { type: String, required: true },
      period: {
        end: { type: Date, default: null },
        start: { type: Date, default: null },
      },
      subscription: { type: String, required: true },
    },
  ],
});

const Invoice = mongoose.model("Invoice", invoiceSchema);

export default Invoice;
