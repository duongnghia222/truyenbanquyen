import { NextResponse } from 'next/server';
import connectDB from '@/lib/postgresql';
import { UserModel } from '@/models/postgresql';
import bcrypt from 'bcryptjs';

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
    const emailCheck = await UserModel.findByEmail(email.toLowerCase());
    if (emailCheck?.rows.length > 0) {
      return NextResponse.json(
        { message: 'Email này đã được sử dụng' },
        { status: 409 }
      );
    }

    // Check if user with this username already exists
    const usernameCheck = await UserModel.findByUsername(username);
    if (usernameCheck?.rows.length > 0) {
      return NextResponse.json(
        { message: 'Tên đăng nhập này đã được sử dụng' },
        { status: 409 }
      );
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create a new user
    const result = await UserModel.createUser({
      display_name: name,
      username,
      email: email.toLowerCase(),
      password_hash: passwordHash,
      role: 'user',
      coins: 0
    });

    const newUser = result.rows[0];

    // Return the user without sensitive information
    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        name: newUser.display_name,
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