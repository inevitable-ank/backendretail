import { supabase } from "../utils/supabaseClient.js"
import { createClient } from "@supabase/supabase-js"
import { prisma } from "../utils/prisma.js"

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3001"
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY

export async function signUp({ email, password, name }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${FRONTEND_URL}/auth/callback`,
      data: { name }
    }
  })

  if (error) {
    throw new Error(error.message)
  }

  // Store user data in database using Prisma
  if (data?.user) {
    try {
      await prisma.user.upsert({
        where: { id: data.user.id },
        update: {
          email: data.user.email,
          name: name || null,
          updatedAt: new Date()
        },
        create: {
          id: data.user.id,
          email: data.user.email,
          name: name || null
        }
      })
      console.log(`✅ User ${data.user.id} saved to database successfully`)
    } catch (dbErr) {
      console.error("❌ Error storing user in database:", dbErr)
      // If it's a connection error, throw it so we know the database isn't set up
      if (dbErr.code === 'P1001' || dbErr.message?.includes('connect')) {
        throw new Error("Database connection failed. Please check your DATABASE_URL in .env file.")
      }
      // Continue even if DB insert fails - auth user is created
      // But log it so we can debug
    }
  }

  return data
}

export async function signIn({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function getUser(accessToken) {
  if (!accessToken) {
    throw new Error("Access token is required")
  }

  // Create a Supabase client instance with the user's access token
  const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  })

  // First get the auth user to get the user ID
  const { data: { user: authUser }, error: authError } = await userClient.auth.getUser()

  if (authError || !authUser) {
    throw new Error(authError?.message || "User not found")
  }

  // Try to get user data from database using Prisma
  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: authUser.id }
    })

    if (dbUser) {
      // Merge database user data with auth user data
      // Format the response to match what frontend expects
      return {
        id: dbUser.id,
        email: dbUser.email || authUser.email,
        // Include name in user_metadata for consistency with frontend expectations
        user_metadata: {
          name: dbUser.name || authUser.user_metadata?.name || null,
          full_name: dbUser.name || authUser.user_metadata?.full_name || null,
          display_name: dbUser.name || authUser.user_metadata?.display_name || null,
          ...authUser.user_metadata
        },
        // Also include name directly for backward compatibility
        name: dbUser.name || authUser.user_metadata?.name || null,
        createdAt: dbUser.createdAt,
        updatedAt: dbUser.updatedAt
      }
    }
  } catch (dbErr) {
    console.error("Error fetching user from database:", dbErr)
    // Fall back to auth user if database query fails
  }

  // Fallback: return auth user if database table doesn't exist or query fails
  // Ensure user_metadata exists even if it's empty
  return {
    ...authUser,
    user_metadata: authUser.user_metadata || {}
  }
}

export async function signOut(accessToken) {
  if (!accessToken) {
    throw new Error("Access token is required")
  }

  // Create a Supabase client instance with the user's access token
  const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  })

  // Sign out using the authenticated client
  const { error } = await userClient.auth.signOut()

  if (error) {
    throw new Error(error.message)
  }

  return { success: true }
}



