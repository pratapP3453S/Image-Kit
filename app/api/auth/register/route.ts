import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import { sendSuccessfulRegistrationEmail } from "@/lib/sendPaymentEmail";

export async function POST(request: NextRequest) {
  try {
    const { email, password, role } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    // Create the user
    const user = await User.create({ email, password, role });

    // Send registration email
    const emailResponse = await sendSuccessfulRegistrationEmail(email, password, role);

    if (!emailResponse.success) {
      return NextResponse.json(
        { error: emailResponse.message || "Failed to send email" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "User registered successfully", user },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Failed to register user" },
      { status: 500 }
    );
  }
}
