import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(req: Request) {
  try {
    const { name, username, email, password } = await req.json();

    // Validate required fields
    if (!name || !username || !email || !password) {
      return NextResponse.json(
        { message: 'Vui lòng điền đầy đủ thông tin' },
        { status: 400 }
      );
    }

    // Validate username length
    if (username.length < 3) {
      return NextResponse.json(
        { message: 'Tên đăng nhập phải có ít nhất 3 ký tự' },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { message: 'Mật khẩu phải có ít nhất 6 ký tự' },
        { status: 400 }
      );
    }

    // Connect to the database
    await connectDB();

    // Check if user with this email already exists
    const emailExists = await User.findOne({ email: email.toLowerCase() });
    if (emailExists) {
      return NextResponse.json(
        { message: 'Email này đã được sử dụng' },
        { status: 409 }
      );
    }

    // Check if user with this username already exists
    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
      return NextResponse.json(
        { message: 'Tên đăng nhập này đã được sử dụng' },
        { status: 409 }
      );
    }

    // Create a new user with hashed password
    // Password hashing is handled in the User model's pre-save hook
    const newUser = await User.create({
      name,
      username,
      email: email.toLowerCase(),
      password,
      budget: {
        coins: 0,
        transactions: []
      },
      role: 'user',
      readingHistory: [],
      bookmarks: [],
      comments: [],
    });

    // Return the user without sensitive information
    return NextResponse.json({
      success: true,
      user: {
        id: newUser._id,
        name: newUser.name,
        username: newUser.username,
        email: newUser.email,
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'Lỗi đăng ký, vui lòng thử lại sau' },
      { status: 500 }
    );
  }
} 