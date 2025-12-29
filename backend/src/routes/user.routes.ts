import { Router } from "express";
import { UserController } from "../controllers/implementations/user.controller";
import { UserRepository } from "../repositories/implementations/user.repository";
import { UserServices } from "../services/implementations/user.services";
import { authenticate, authorize } from "../middlewares/auth.middleware";



const userRouter = Router();


const userRepo = new UserRepository();
const userServices = new UserServices(userRepo);
const userController = new UserController(userServices);



userRouter.get('/profile', authenticate, authorize('admin', 'user', 'host'), userController.getUserProfile.bind(userController));




export default userRouter;