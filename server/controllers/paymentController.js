const Payment = require('../models/paymentModel');

// const createPayment = async (req, res) => {
//   try {
//     const { userId, amount } = req.body;
//     const payment = new Payment({
//       userId,
//       amount,
//       status: 'pending',
//       date: new Date()
//     });
//     await payment.save();
//     res.status(201).json(payment);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// };


const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const createPayment = async (req, res) => {
  try {
    const { userId, amount } = req.body;

    // Create a Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100,
      currency: 'usd',
      metadata: { userId },
    });

    // Create a new payment document with the Stripe PaymentIntent ID
    const payment = new Payment({
      userId,
      amount,
      status: paymentIntent.status,
      paymentIntentId: paymentIntent.id,
      date: new Date()
    });

    await payment.save();

    // Send the client secret to the client to confirm the payment on the front-end
    res.status(201).json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};



// const updatePaymentStatus = async (req, res) => {
//   try {
//     const { paymentId, status } = req.body;
//     const payment = await Payment.findById(paymentId);
//     if (!payment) {
//       return res.status(404).json({ error: 'Payment not found' });
//     }
//     payment.status = status;
//     await payment.save();
//     res.json(payment);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// };

const updatePaymentStatus = async (req, res) => {
  try {
    const { paymentIntent } = req.body.data.object;

    // Find the payment by its ID in the metadata
    const payment = await Payment.findById(paymentIntent.metadata.paymentId);
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Update the payment status in the database
    payment.status = paymentIntent.status;
    await payment.save();

    res.sendStatus(200);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


module.exports = {
  createPayment,
  updatePaymentStatus
};
