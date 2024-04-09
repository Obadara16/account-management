const express = require("express");
const router = express.Router();
const {  createPayment, updatePaymentStatus } = require("../controllers/paymentController");
const stripe = require('stripe')('your_stripe_secret_key');

router.post('/', createPayment);
router.patch('/:id', updatePaymentStatus);

// Stripe webhook route
router.post('/stripe-webhook', async (req, res) => {
    const sig = req.headers['stripe-signature'];
  
    try {
      const event = stripe.webhooks.constructEvent(req.body, sig, 'your_stripe_webhook_secret');
  
      if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
  
        const payment = await Payment.findOne({ paymentIntentId: paymentIntent.id });
  
        if (!payment) {
          return res.status(404).json({ error: 'Payment not found' });
        }
  
        payment.status = 'successful';
  
        await payment.save();
      }
  
      res.status(200).send();
    } catch (error) {
      res.status(400).send(`Webhook Error: ${error.message}`);
    }
  });



module.exports = router;
