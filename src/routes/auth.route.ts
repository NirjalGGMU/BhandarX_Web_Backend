import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";
import { uploads } from "../middlewares/upload.middleware";

let authController = new AuthController();
const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/whoami", authorizedMiddleware, authController.getProfile);
router.put(
    "/update-profile",
    authorizedMiddleware,
    uploads.single("image"),
    authController.updateProfile
);

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
