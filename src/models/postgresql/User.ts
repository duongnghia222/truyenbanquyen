import { query, transaction } from '../../config/database';
import bcrypt from 'bcryptjs';

// User type definition
export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  password?: string;
  googleId?: string;
  image?: string;
  coins: number;
  role: 'user' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

// Type for transaction history
export interface UserTransaction {
  id: number;
  userId: number;
  amount: number;
  description: string;
  novelId?: number;
  createdAt: Date;
}

// Type for reading history
export interface ReadingHistory {
  id: number;
  userId: number;
  novelId: number;
  lastChapterId?: number;
  lastReadAt: Date;
}

class UserModel {
  /**
   * Create a new user
   */
  async create(userData: Omit<User, 'id' | 'coins' | 'createdAt' | 'updatedAt'>): Promise<User> {
    // Hash password if provided
    if (userData.password) {
      const salt = await bcrypt.genSalt(10);
      userData.password = await bcrypt.hash(userData.password, salt);
    }

    const result = await query(
      `INSERT INTO users (name, username, email, password, google_id, image, role)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        userData.name,
        userData.username,
        userData.email,
        userData.password || null,
        userData.googleId || null,
        userData.image || null,
        userData.role || 'user'
      ]
    );

    return this.transformUserData(result.rows[0]);
  }

  /**
   * Create a new user (alternative method for auth)
   * Maps from auth field names to database field names
   */
  async createUser(userData: {
    display_name?: string;
    username: string;
    email?: string;
    password_hash?: string;
    google_id?: string;
    avatar_url?: string;
    role?: string;
  }) {
    return query(
      `INSERT INTO users (name, username, email, password, google_id, image, role)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        userData.display_name || userData.username,
        userData.username,
        userData.email || null,
        userData.password_hash || null,
        userData.google_id || null,
        userData.avatar_url || null,
        userData.role || 'user'
      ]
    );
  }

  /**
   * Find a user by ID
   */
  async findById(id: number): Promise<User | null> {
    const result = await query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return this.transformUserData(result.rows[0]);
  }

  /**
   * Find a user by email (for auth)
   */
  async findByEmail(email: string | undefined | null) {
    if (!email) return { rows: [] };
    
    return query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
  }

  /**
   * Find a user by username
   */
  async findByUsername(username: string): Promise<User | null> {
    const result = await query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return this.transformUserData(result.rows[0]);
  }

  /**
   * Find a user by Google ID (for auth)
   */
  async findByGoogleId(googleId: string | undefined | null) {
    if (!googleId) return { rows: [] };
    
    return query(
      'SELECT * FROM users WHERE google_id = $1',
      [googleId]
    );
  }

  /**
   * Update Google ID for a user (for auth)
   */
  async updateGoogleId(userId: number, googleId: string | undefined | null) {
    if (!googleId) return null;
    
    return query(
      'UPDATE users SET google_id = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [googleId, userId]
    );
  }

  /**
   * Update a user
   */
  async update(id: number, userData: Partial<User>): Promise<User | null> {
    // Start building the query
    let updateQuery = 'UPDATE users SET ';
    const queryParams: (string | number | Date | null)[] = [];
    const updateFields: string[] = [];
    let paramIndex = 1;

    // Add each field that needs to be updated
    if (userData.name !== undefined) {
      updateFields.push(`name = $${paramIndex++}`);
      queryParams.push(userData.name);
    }

    if (userData.username !== undefined) {
      updateFields.push(`username = $${paramIndex++}`);
      queryParams.push(userData.username);
    }

    if (userData.email !== undefined) {
      updateFields.push(`email = $${paramIndex++}`);
      queryParams.push(userData.email);
    }

    if (userData.password !== undefined) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);
      updateFields.push(`password = $${paramIndex++}`);
      queryParams.push(hashedPassword);
    }

    if (userData.googleId !== undefined) {
      updateFields.push(`google_id = $${paramIndex++}`);
      queryParams.push(userData.googleId);
    }

    if (userData.image !== undefined) {
      updateFields.push(`image = $${paramIndex++}`);
      queryParams.push(userData.image);
    }

    if (userData.role !== undefined) {
      updateFields.push(`role = $${paramIndex++}`);
      queryParams.push(userData.role);
    }

    // Always update the updated_at timestamp
    updateFields.push(`updated_at = NOW()`);

    // Finalize the query
    updateQuery += updateFields.join(', ');
    updateQuery += ` WHERE id = $${paramIndex} RETURNING *`;
    queryParams.push(id);

    const result = await query(updateQuery, queryParams);

    if (result.rows.length === 0) {
      return null;
    }

    return this.transformUserData(result.rows[0]);
  }

  /**
   * Delete a user
   */
  async delete(id: number): Promise<boolean> {
    const result = await query(
      'DELETE FROM users WHERE id = $1 RETURNING id',
      [id]
    );

    return result.rows.length > 0;
  }

  /**
   * Compare a password with the stored hash
   */
  async comparePassword(userId: number, candidatePassword: string): Promise<boolean> {
    const result = await query(
      'SELECT password FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0 || !result.rows[0].password) {
      return false;
    }

    return await bcrypt.compare(candidatePassword, result.rows[0].password);
  }

  /**
   * Add coins to a user's budget
   */
  async addCoins(userId: number, amount: number, description: string, novelId?: number): Promise<User | null> {
    return transaction<User | null>(async (client) => {
      // Add transaction record
      await client.query(
        `INSERT INTO user_transactions (user_id, amount, description, novel_id)
         VALUES ($1, $2, $3, $4)`,
        [userId, amount, description, novelId || null]
      );

      // Update user's coin balance
      const result = await client.query(
        `UPDATE users SET coins = coins + $1, updated_at = NOW()
         WHERE id = $2
         RETURNING *`,
        [amount, userId]
      );

      if (result.rows.length === 0) {
        throw new Error(`User with ID ${userId} not found`);
      }

      return this.transformUserData(result.rows[0]);
    });
  }

  /**
   * Get user's transaction history
   */
  async getTransactionHistory(userId: number): Promise<UserTransaction[]> {
    const result = await query(
      `SELECT * FROM user_transactions
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    return result.rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      amount: row.amount,
      description: row.description,
      novelId: row.novel_id,
      createdAt: row.created_at
    }));
  }

  /**
   * Add a novel to user's bookmarks
   */
  async addBookmark(userId: number, novelId: number): Promise<boolean> {
    try {
      await query(
        `INSERT INTO bookmarks (user_id, novel_id)
         VALUES ($1, $2)
         ON CONFLICT (user_id, novel_id) DO NOTHING`,
        [userId, novelId]
      );
      return true;
    } catch (error) {
      console.error('Error adding bookmark:', error);
      return false;
    }
  }

  /**
   * Remove a novel from user's bookmarks
   */
  async removeBookmark(userId: number, novelId: number): Promise<boolean> {
    const result = await query(
      `DELETE FROM bookmarks
       WHERE user_id = $1 AND novel_id = $2
       RETURNING user_id`,
      [userId, novelId]
    );

    return result.rows.length > 0;
  }

  /**
   * Get user's bookmarked novels
   */
  async getBookmarks(userId: number): Promise<number[]> {
    const result = await query(
      `SELECT novel_id FROM bookmarks
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    return result.rows.map(row => row.novel_id);
  }

  /**
   * Update user's reading history
   */
  async updateReadingHistory(userId: number, novelId: number, chapterId: number): Promise<void> {
    await query(
      `INSERT INTO reading_history (user_id, novel_id, last_chapter_id, last_read_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (user_id, novel_id) 
       DO UPDATE SET last_chapter_id = $3, last_read_at = NOW()`,
      [userId, novelId, chapterId]
    );
  }

  /**
   * Get user's reading history
   */
  async getReadingHistory(userId: number): Promise<ReadingHistory[]> {
    const result = await query(
      `SELECT * FROM reading_history WHERE user_id = $1 ORDER BY last_read_at DESC`,
      [userId]
    );

    return result.rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      novelId: row.novel_id,
      lastChapterId: row.last_chapter_id,
      lastReadAt: row.last_read_at
    }));
  }

  /**
   * Find multiple users by their IDs
   */
  async findByIds(ids: number[]): Promise<User[]> {
    if (!ids.length) return [];
    
    // Create a parameterized query with the correct number of parameters
    const params = ids.map((_, i) => `$${i + 1}`).join(',');
    
    const result = await query(
      `SELECT * FROM users WHERE id IN (${params})`,
      ids
    );

    return result.rows.map(this.transformUserData);
  }

  /**
   * Transform database row to User object
   */
  private transformUserData(row: Record<string, unknown>): User {
    return {
      id: Number(row.id),
      name: String(row.name),
      username: String(row.username),
      email: String(row.email),
      password: row.password ? String(row.password) : undefined,
      googleId: row.google_id ? String(row.google_id) : undefined,
      image: row.image ? String(row.image) : undefined,
      coins: Number(row.coins),
      role: String(row.role) as 'user' | 'admin',
      createdAt: new Date(row.created_at as string),
      updatedAt: new Date(row.updated_at as string)
    };
  }
}

const userModel = new UserModel();
export default userModel; 