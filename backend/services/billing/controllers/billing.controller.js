import crypto from "crypto";

import razorpay from "../config/razorpay.js";
import { PLANS } from "../config/Plans.js";
import Payment from "../models/payment.model.js";

const getUserId = (req) => req.headers["x-user-id"];

export const getPlans = (req, res) => {
	return res.status(200).json({
		plans: Object.values(PLANS),
	});
};

export const createOrder = async (req, res) => {
	try {
		const userId = getUserId(req);
		const { plan: planId } = req.body;
		const plan = PLANS[planId];

		if (!userId) {
			return res.status(401).json({ message: "User authentication is required" });
		}

		if (!plan || plan.id === "free") {
			return res.status(400).json({ message: "A valid paid plan is required" });
		}

		const order = await razorpay.orders.create({
			amount: plan.amount * 100,
			currency: "INR",
			receipt: `receipt_${userId}_${Date.now()}`,
			notes: {
				userId,
				plan: plan.id,
			},
		});

		await Payment.create({
			userId,
			orderId: order.id,
			amount: plan.amount,
			currency: order.currency,
			credits: plan.credits,
			plan: plan.id,
			status: "created",
		});

		return res.status(201).json({
			keyId: process.env.RAZORPAY_KEY_ID,
			orderId: order.id,
			amount: order.amount,
			currency: order.currency,
			plan: {
				id: plan.id,
				name: plan.name,
				credits: plan.credits,
			},
		});
	} catch (error) {
		console.error("Create payment order error:", error);
		return res.status(500).json({ message: "Unable to create payment order" });
	}
};

export const verifyPayment = async (req, res) => {
	try {
		const userId = getUserId(req);
		const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

		if (!userId) {
			return res.status(401).json({ message: "User authentication is required" });
		}

		if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
			return res.status(400).json({ message: "Payment verification details are required" });
		}

		const expectedSignature = crypto
			.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
			.update(`${razorpayOrderId}|${razorpayPaymentId}`)
			.digest();
		const receivedSignature = Buffer.from(razorpaySignature, "hex");

		const signatureIsValid =
			receivedSignature.length === expectedSignature.length &&
			crypto.timingSafeEqual(receivedSignature, expectedSignature);

		if (!signatureIsValid) {
			return res.status(400).json({ message: "Invalid payment signature" });
		}

		const payment = await Payment.findOneAndUpdate(
			{ orderId: razorpayOrderId, userId },
			{
				paymentId: razorpayPaymentId,
				status: "paid",
			},
			{ new: true }
		);

		if (!payment) {
			return res.status(404).json({ message: "Payment order not found" });
		}

		return res.status(200).json({
			message: "Payment verified successfully",
			payment,
		});
	} catch (error) {
		console.error("Verify payment error:", error);
		return res.status(500).json({ message: "Unable to verify payment" });
	}
};

export const getPayment = async (req, res) => {
	try {
		const userId = getUserId(req);
		const payment = await Payment.findOne({
			orderId: req.params.orderId,
			userId,
		});

		if (!payment) {
			return res.status(404).json({ message: "Payment not found" });
		}

		return res.status(200).json({ payment });
	} catch (error) {
		console.error("Get payment error:", error);
		return res.status(500).json({ message: "Unable to fetch payment" });
	}
};

export const getCurrentPlan = async (req, res) => {
	try {
		const userId = getUserId(req);
		const payment = await Payment.findOne({
			userId,
			status: "paid",
		}).sort({ createdAt: -1 });

		return res.status(200).json({
			plan: payment?.plan || "free",
			payment: payment || null,
		});
	} catch (error) {
		console.error("Get current plan error:", error);
		return res.status(500).json({ message: "Unable to fetch current plan" });
	}
};
