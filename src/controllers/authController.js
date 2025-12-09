import { signIn, signUp, getUser, signOut } from "../services/authService.js"

export async function handleSignUp(req, res) {
  try {
    const { email, password, name } = req.body
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" })
    }

    const data = await signUp({ email, password, name })
    return res
      .status(201)
      .json({ message: "Signup successful. Please verify your email.", data })
  } catch (err) {
    return res.status(400).json({ message: err.message })
  }
}

export async function handleSignIn(req, res) {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" })
    }

    const data = await signIn({ email, password })
    
    // Set httpOnly cookie with access token
    if (data?.session?.access_token) {
      res.cookie("access_token", data.session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7 * 1000 // 7 days
      })
    }
    
    return res.status(200).json({ message: "Login successful", data })
  } catch (err) {
    return res.status(401).json({ message: err.message })
  }
}

export async function handleGetUser(req, res) {
  try {
    // Try to get token from cookie first, then from Authorization header
    const accessToken = req.cookies?.access_token || 
                       (req.headers.authorization?.startsWith("Bearer ") 
                         ? req.headers.authorization.substring(7) 
                         : null)
    
    if (!accessToken) {
      return res.status(401).json({ message: "Authorization token is required" })
    }

    const user = await getUser(accessToken)
    
    return res.status(200).json({ user })
  } catch (err) {
    return res.status(401).json({ message: err.message })
  }
}

export async function handleSignOut(req, res) {
  try {
    // Try to get token from cookie first, then from Authorization header
    const accessToken = req.cookies?.access_token || 
                       (req.headers.authorization?.startsWith("Bearer ") 
                         ? req.headers.authorization.substring(7) 
                         : null)
    
    if (accessToken) {
      await signOut(accessToken)
    }
    
    // Clear the cookie
    res.clearCookie("access_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax"
    })
    
    return res.status(200).json({ message: "Sign out successful" })
  } catch (err) {
    // Clear cookie even if signout fails
    res.clearCookie("access_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax"
    })
    return res.status(200).json({ message: "Sign out successful" })
  }
}



