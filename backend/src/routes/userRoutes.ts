import { Router } from "express";

import {
  addAssistant,
  addCustomer,
  getAllAssistants,
  getAllCustomers,
  editAssistant,
  editCustomer,
  removeAssistant,
  removeCustomer,
} from "../controllers/userController";

import { authenticate } from "../middlewares/authMiddleware";
import { authorizeRoles } from "../middlewares/roleMiddleware";

import { UserRole } from "../entities/User";

const router = Router();

router.post(
  "/assistants",
  authenticate,
  authorizeRoles(UserRole.SHOP_OWNER),
  addAssistant
);

router.get(
  "/assistants",
  authenticate,
  authorizeRoles(UserRole.SHOP_OWNER),
  getAllAssistants
);

router.put(
  "/assistants/:userId",
  authenticate,
  authorizeRoles(UserRole.SHOP_OWNER),
  editAssistant
);

router.delete(
  "/assistants/:userId",
  authenticate,
  authorizeRoles(UserRole.SHOP_OWNER),
  removeAssistant
);


router.post(
  "/customers",
  authenticate,
  authorizeRoles(UserRole.SHOP_OWNER),
  addCustomer
);

router.get(
  "/customers",
  authenticate,
  authorizeRoles(UserRole.SHOP_OWNER),
  getAllCustomers
);

router.put(
  "/customers/:userId",
  authenticate,
  authorizeRoles(UserRole.SHOP_OWNER),
  editCustomer
);


router.delete(
  "/customers/:userId",
  authenticate,
  authorizeRoles(UserRole.SHOP_OWNER),
  removeCustomer
);

export default router;