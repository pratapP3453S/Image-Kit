import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import Order from "@/models/Order";
import { connectToDatabase } from "@/lib/db";
import { sendPaymentSuccessEmail, sendPaymentUnsuccessEmail } from "@/lib/sendPaymentEmail";
// import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-razorpay-signature");
    console.log(body)
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(body)
      .digest("hex");

    if (signature !== expectedSignature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }
    console.log("yes completed.")
    const event = JSON.parse(body);
    await connectToDatabase();

    if (event.event === "payment.captured") {
      const payment = event.payload.payment.entity;
      console.log(payment);
      const order = await Order.findOneAndUpdate(
        { razorpayOrderId: payment.order_id },
        {
          razorpayPaymentId: payment.id,
          status: 'completed',
        }
      ).populate([
        { path: 'userId', select: 'email' },
        { path: 'productId', select: 'name amount razorpayOrderId' }, // Populate once with required fields
      ]);
      console.log(order)

      if (order) {
        // Send email only after payment is confirmed
        const emailResponse = await sendPaymentSuccessEmail(
          order.userId.email, // Access email from userId
          order.productId.name, // Product name
          order.productId.amount, // Amount
          order.razorpayOrderId, // Order ID
        );
        if(!emailResponse.success){
          await sendPaymentUnsuccessEmail(
            order.userId.email, // Access email from userId
            order.productId.name, // Product name
            order.productId.amount, // Amount
            order.razorpayOrderId, // Order ID
          )
        }
      }

       return NextResponse.json(order, { status: 200 })
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}
