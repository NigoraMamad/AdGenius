import { createSupabaseAdmin, createClientSupabaseClient } from "./supabase";
import type { User } from "@/types";

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
}

interface AuthResult {
  user: User | null;
  error: string | null;
  isNewUser: boolean;
}

class AuthService {
  private supabaseAdmin = createSupabaseAdmin();

  /**
   * Authenticate or create user from Telegram data
   */
  async authenticateTelegramUser(
    telegramUser: TelegramUser
  ): Promise<AuthResult> {
    try {
      const telegramId = telegramUser.id.toString();

      // First, try to find existing user
      const { data: existingUser, error: findError } = await this.supabaseAdmin
        .from("users")
        .select("*")
        .eq("telegram_id", telegramId)
        .single();

      if (existingUser && !findError) {
        // Update user info (in case Telegram data changed)
        const { data: updatedUser, error: updateError } =
          await this.supabaseAdmin
            .from("users")
            .update({
              first_name: telegramUser.first_name,
              last_name: telegramUser.last_name,
              username: telegramUser.username,
              language_code: telegramUser.language_code,
              is_premium: telegramUser.is_premium,
              last_login_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq("telegram_id", telegramId)
            .select()
            .single();

        if (updateError) {
          console.error("Error updating user:", updateError);
          return { user: existingUser, error: null, isNewUser: false };
        }

        console.log(`✅ Telegram user ${telegramUser.first_name} logged in`);
        return { user: updatedUser, error: null, isNewUser: false };
      }

      // Create new user
      const newUser = {
        telegram_id: telegramId,
        first_name: telegramUser.first_name,
        last_name: telegramUser.last_name,
        username: telegramUser.username,
        language_code: telegramUser.language_code || "en",
        is_premium: telegramUser.is_premium || false,
        auth_provider: "telegram" as const,
        last_login_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data: createdUser, error: createError } = await this.supabaseAdmin
        .from("users")
        .insert([newUser])
        .select()
        .single();

      if (createError) {
        console.error("Error creating user:", createError);
        return { user: null, error: createError.message, isNewUser: false };
      }

      console.log(`✅ New Telegram user ${telegramUser.first_name} created`);
      return { user: createdUser, error: null, isNewUser: true };
    } catch (error) {
      console.error("Telegram auth error:", error);
      return { user: null, error: "Authentication failed", isNewUser: false };
    }
  }

  /**
   * Authenticate user with Google OAuth (for web version)
   */
  async authenticateGoogleUser(googleUser: any): Promise<AuthResult> {
    try {
      const googleId = googleUser.id;
      const email = googleUser.email;

      // Try to find existing user by Google ID or email
      const { data: existingUser, error: findError } = await this.supabaseAdmin
        .from("users")
        .select("*")
        .or(`google_id.eq.${googleId},email.eq.${email}`)
        .single();

      if (existingUser && !findError) {
        // Update user info
        const { data: updatedUser, error: updateError } =
          await this.supabaseAdmin
            .from("users")
            .update({
              google_id: googleId,
              email: email,
              first_name: existingUser.first_name || googleUser.given_name,
              last_name: existingUser.last_name || googleUser.family_name,
              avatar_url: existingUser.avatar_url || googleUser.picture,
              last_login_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq("id", existingUser.id)
            .select()
            .single();

        if (updateError) {
          console.error("Error updating Google user:", updateError);
          return { user: existingUser, error: null, isNewUser: false };
        }

        console.log(`✅ Google user ${email} logged in`);
        return { user: updatedUser, error: null, isNewUser: false };
      }

      // Create new user with Google data
      const newUser = {
        google_id: googleId,
        email: email,
        first_name: googleUser.given_name,
        last_name: googleUser.family_name,
        avatar_url: googleUser.picture,
        language_code: "en",
        auth_provider: "google" as const,
        last_login_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data: createdUser, error: createError } = await this.supabaseAdmin
        .from("users")
        .insert([newUser])
        .select()
        .single();

      if (createError) {
        console.error("Error creating Google user:", createError);
        return { user: null, error: createError.message, isNewUser: false };
      }

      console.log(`✅ New Google user ${email} created`);
      return { user: createdUser, error: null, isNewUser: true };
    } catch (error) {
      console.error("Google auth error:", error);
      return { user: null, error: "Authentication failed", isNewUser: false };
    }
  }

  /**
   * Link Telegram and Google accounts
   */
  async linkAccounts(telegramId: string, googleId: string): Promise<boolean> {
    try {
      // Find Telegram user
      const { data: telegramUser, error: telegramError } =
        await this.supabaseAdmin
          .from("users")
          .select("*")
          .eq("telegram_id", telegramId)
          .single();

      if (telegramError || !telegramUser) {
        console.error("Telegram user not found for linking");
        return false;
      }

      // Find Google user
      const { data: googleUser, error: googleError } = await this.supabaseAdmin
        .from("users")
        .select("*")
        .eq("google_id", googleId)
        .single();

      if (googleError || !googleUser) {
        console.error("Google user not found for linking");
        return false;
      }

      // Merge accounts (keep Telegram user, add Google data)
      const { error: updateError } = await this.supabaseAdmin
        .from("users")
        .update({
          google_id: googleUser.google_id,
          email: googleUser.email,
          avatar_url: googleUser.avatar_url || telegramUser.avatar_url,
          updated_at: new Date().toISOString(),
        })
        .eq("telegram_id", telegramId);

      if (updateError) {
        console.error("Error linking accounts:", updateError);
        return false;
      }

      // Remove the duplicate Google-only user
      await this.supabaseAdmin.from("users").delete().eq("id", googleUser.id);

      console.log(`✅ Accounts linked for Telegram ID ${telegramId}`);
      return true;
    } catch (error) {
      console.error("Account linking error:", error);
      return false;
    }
  }

  /**
   * Get user by Telegram ID
   */
  async getUserByTelegramId(telegramId: string): Promise<User | null> {
    try {
      const { data: user, error } = await this.supabaseAdmin
        .from("users")
        .select("*")
        .eq("telegram_id", telegramId)
        .single();

      if (error) {
        console.error("Error fetching user by Telegram ID:", error);
        return null;
      }

      return user;
    } catch (error) {
      console.error("Error in getUserByTelegramId:", error);
      return null;
    }
  }

  /**
   * Get user by Google ID
   */
  async getUserByGoogleId(googleId: string): Promise<User | null> {
    try {
      const { data: user, error } = await this.supabaseAdmin
        .from("users")
        .select("*")
        .eq("google_id", googleId)
        .single();

      if (error) {
        console.error("Error fetching user by Google ID:", error);
        return null;
      }

      return user;
    } catch (error) {
      console.error("Error in getUserByGoogleId:", error);
      return null;
    }
  }
}

export const authService = new AuthService();
export type { TelegramUser, AuthResult };
