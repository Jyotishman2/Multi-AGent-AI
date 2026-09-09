import dotenv from "dotenv";
import Razorpay from "razorpay";

dotenv.config();

const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = process.env;

if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
	throw new Error("RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are required");
}

const razorpay = new Razorpay({
	key_id: RAZORPAY_KEY_ID,
	key_secret: RAZORPAY_KEY_SECRET,
});

export { RAZORPAY_KEY_ID };
export default razorpay;
