import { Router } from "express";
import { register, login, updateProfile } from "../controllers/auth.controller";
import { authMiddleware } from "../middlewares/auth";
import { upload } from "../config/multer";

const router = Router();
router.post("/register", register);
router.post("/login", login);
router.put("/:id", authMiddleware, upload.single("image"), updateProfile);  // Added

export default router;




// import { Router } from "express";
// import { register, login } from "../controllers/auth.controller";

// const router = Router();

// router.post("/register", register);
// router.post("/login", login);

// export default router;










// import { Router } from "express";
// import { loginUser, registerUser } from "../controllers/auth.controller";

// const router = Router();

// router.post("/register", registerUser);
// router.post("/login", loginUser);

// export default router;
