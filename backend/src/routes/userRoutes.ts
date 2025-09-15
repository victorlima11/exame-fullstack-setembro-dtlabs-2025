import express from "express";
import { login, register, getAllUsers, getUserById, updateUser, deleteUser } from "../controllers/userController";
import { validateUserLogin, validateUserRegister } from "../middlewares/userMiddleware";
import { authMiddleware } from "../middlewares/authMiddleware";
import { Router } from "express";
const router: Router = express.Router();


router.post("/login", validateUserLogin, login);
router.post("/register", validateUserRegister, register);

router.get("/", authMiddleware, getAllUsers);
router.get("/:id", authMiddleware, getUserById);
router.put("/:id", authMiddleware, updateUser);
router.delete("/:id", authMiddleware, deleteUser);

export default router;