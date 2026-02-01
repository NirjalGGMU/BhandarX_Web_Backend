import { Router } from "express";
import { register, login } from "../controllers/auth.controller";

const router = Router();

router.post("/register", register);
router.post("/login", login);

export default router;

// import { Router } from "express";
// import { loginUser, registerUser } from "../controllers/auth.controller";

// const router = Router();

// router.post("/register", registerUser);
// router.post("/login", loginUser);

// export default router;
