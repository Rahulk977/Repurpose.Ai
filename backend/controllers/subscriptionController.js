const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/User');

// ─── Plan config ──────────────────────────────────────────────────────────────
const PLANS = {
  pro: {
    priceId: process.env.STRIPE_PRO_PRICE_ID,
    name: 'Pro Plan',
    amount: 1900,
  },
  creator: {
    priceId: process.env.STRIPE_CREATOR_PRICE_ID,
    name: 'Creator Plan',
    amount: 3900,
  },
};

// ─── POST /api/subscription/create ───────────────────────────────────────────
exports.createCheckoutSession = async (req, res) => {
  try {
    const { plan } = req.body;
    if (!PLANS[plan]) {
      return res.status(400).json({ message: 'Invalid plan. Choose "pro" or "creator".' });
    }

    const user = await User.findById(req.user._id);

    // Get or create Stripe customer
    let customerId = user.subscription.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: { userId: user._id.toString() },
      });
      customerId = customer.id;
      user.subscription.stripeCustomerId = customerId;
      await user.save();
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: PLANS[plan].priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/billing?cancelled=true`,
      metadata: { userId: user._id.toString(), plan },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      subscription_data: {
        metadata: { userId: user._id.toString(), plan },
      },
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (err) {
    console.error('createCheckoutSession error:', err);
    res.status(500).json({ message: 'Failed to create checkout session.' });
  }
};

// ─── POST /api/subscription/portal ───────────────────────────────────────────
exports.createPortalSession = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user.subscription.stripeCustomerId) {
      return res.status(400).json({ message: 'No billing account found. Please subscribe first.' });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: user.subscription.stripeCustomerId,
      return_url: `${process.env.FRONTEND_URL}/billing`,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('createPortalSession error:', err);
    res.status(500).json({ message: 'Failed to open billing portal.' });
  }
};

// ─── POST /api/subscription/webhook ──────────────────────────────────────────
exports.handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        if (session.mode !== 'subscription') break;

        const userId = session.metadata.userId;
        const plan = session.metadata.plan;
        const sub = await stripe.subscriptions.retrieve(session.subscription);

        await User.findByIdAndUpdate(userId, {
          'subscription.plan': plan,
          'subscription.stripeSubscriptionId': session.subscription,
          'subscription.currentPeriodEnd': new Date(sub.current_period_end * 1000),
          'subscription.status': 'active',
        });
        console.log(`✅ Subscription activated: userId=${userId} plan=${plan}`);
        break;
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object;
        const customer = await stripe.customers.retrieve(sub.customer);
        const userId = customer.metadata.userId;
        if (!userId) break;

        const planId = sub.metadata.plan;
        const updates = {
          'subscription.currentPeriodEnd': new Date(sub.current_period_end * 1000),
          'subscription.status': sub.status,
        };
        if (planId) updates['subscription.plan'] = planId;

        await User.findByIdAndUpdate(userId, updates);
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        const customer = await stripe.customers.retrieve(sub.customer);
        const userId = customer.metadata.userId;
        if (!userId) break;

        await User.findByIdAndUpdate(userId, {
          'subscription.plan': 'free',
          'subscription.stripeSubscriptionId': null,
          'subscription.currentPeriodEnd': null,
          'subscription.status': 'inactive',
        });
        console.log(`🔻 Subscription cancelled: userId=${userId}`);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const customer = await stripe.customers.retrieve(invoice.customer);
        if (customer.metadata.userId) {
          await User.findByIdAndUpdate(customer.metadata.userId, {
            'subscription.status': 'past_due',
          });
        }
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object;
        const customer = await stripe.customers.retrieve(invoice.customer);
        if (customer.metadata.userId) {
          await User.findByIdAndUpdate(customer.metadata.userId, {
            'subscription.status': 'active',
          });
        }
        break;
      }

      default:
        break;
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Webhook handler error:', err);
    res.status(500).json({ message: 'Webhook handler failed.' });
  }
};

// ─── GET /api/subscription/status ────────────────────────────────────────────
exports.getStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.resetMonthlyUsageIfNeeded();
    await user.save();

    res.json({
      subscription: user.subscription,
      usage: {
        ...user.usage.toObject(),
        remainingGenerations: user.remainingGenerations,
        limit: User.PLAN_LIMITS[user.subscription.plan],
      },
      plans: {
        free: { limit: 3, features: ['3 generations/month', 'All 6 formats', 'Text input', 'Copy & export'] },
        pro: { price: 19, features: ['Unlimited generations', 'All 6 formats', 'YouTube + Audio input', 'Editable cards', 'Full history', 'Priority support'] },
        creator: { price: 39, features: ['Everything in Pro', 'GPT-4 Turbo quality', 'Priority AI processing', 'API access', 'Early features', 'Dedicated support'] },
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch subscription status.' });
  }
};
