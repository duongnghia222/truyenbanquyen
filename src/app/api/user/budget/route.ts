import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';

// Get user budget details
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user.id) {
      return NextResponse.json(
        { message: 'Bạn cần đăng nhập để thực hiện chức năng này' },
        { status: 401 }
      );
    }
    
    await connectDB();
    
    const user = await User.findById(session.user.id).select('budget');
    
    if (!user) {
      return NextResponse.json(
        { message: 'Không tìm thấy thông tin người dùng' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ budget: user.budget });
    
  } catch (error) {
    console.error('Error fetching user budget:', error);
    return NextResponse.json(
      { message: 'Lỗi khi lấy thông tin ngân sách' },
      { status: 500 }
    );
  }
}

// Add coins to user budget
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user.id) {
      return NextResponse.json(
        { message: 'Bạn cần đăng nhập để thực hiện chức năng này' },
        { status: 401 }
      );
    }
    
    const { amount, description } = await req.json();
    
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { message: 'Số tiền không hợp lệ' },
        { status: 400 }
      );
    }
    
    await connectDB();
    
    const user = await User.findById(session.user.id);
    
    if (!user) {
      return NextResponse.json(
        { message: 'Không tìm thấy thông tin người dùng' },
        { status: 404 }
      );
    }
    
    // Add coins and record transaction
    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      {
        $inc: { 'budget.coins': amount },
        $push: {
          'budget.transactions': {
            amount,
            description: description || 'Nạp tiền',
            createdAt: new Date()
          }
        }
      },
      { new: true }
    ).select('budget');
    
    return NextResponse.json({ budget: updatedUser.budget });
    
  } catch (error) {
    console.error('Error adding coins to budget:', error);
    return NextResponse.json(
      { message: 'Lỗi khi nạp tiền' },
      { status: 500 }
    );
  }
}

// Purchase a novel chapter
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user.id) {
      return NextResponse.json(
        { message: 'Bạn cần đăng nhập để thực hiện chức năng này' },
        { status: 401 }
      );
    }
    
    const { amount, novelId, description } = await req.json();
    
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { message: 'Số tiền không hợp lệ' },
        { status: 400 }
      );
    }
    
    if (!novelId) {
      return NextResponse.json(
        { message: 'ID truyện là bắt buộc' },
        { status: 400 }
      );
    }
    
    await connectDB();
    
    const user = await User.findById(session.user.id);
    
    if (!user) {
      return NextResponse.json(
        { message: 'Không tìm thấy thông tin người dùng' },
        { status: 404 }
      );
    }
    
    // Check if user has enough coins
    if (user.budget.coins < amount) {
      return NextResponse.json(
        { message: 'Số dư không đủ để thực hiện giao dịch này' },
        { status: 400 }
      );
    }
    
    // Deduct coins and record transaction
    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      {
        $inc: { 'budget.coins': -amount },
        $push: {
          'budget.transactions': {
            amount: -amount,
            description: description || 'Mua chương truyện',
            novelId,
            createdAt: new Date()
          }
        }
      },
      { new: true }
    ).select('budget');
    
    return NextResponse.json({ 
      success: true,
      budget: updatedUser.budget 
    });
    
  } catch (error) {
    console.error('Error processing purchase:', error);
    return NextResponse.json(
      { message: 'Lỗi khi xử lý giao dịch' },
      { status: 500 }
    );
  }
} 