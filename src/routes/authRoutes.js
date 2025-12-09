import { Router } from "express"
import { handleSignIn, handleSignUp, handleGetUser, handleSignOut } from "../controllers/authController.js"

const router = Router()

router.post("/signup", handleSignUp)
router.post("/login", handleSignIn)
router.get("/me", handleGetUser)
router.post("/logout", handleSignOut)

export default router



