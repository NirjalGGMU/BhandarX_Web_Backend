import { Router } from "express";
import { authMiddleware, adminMiddleware } from "../middlewares/auth";
import { upload } from "../config/multer";
import { getAllUsers, getUserById, createAdminUser, updateAdminUser, deleteAdminUser } from "../controllers/admin.controller";

const router = Router();

router.use(authMiddleware, adminMiddleware);

router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.post("/", upload.single("image"), createAdminUser);
router.put("/:id", upload.single("image"), updateAdminUser);
router.delete("/:id", deleteAdminUser);

export default router;