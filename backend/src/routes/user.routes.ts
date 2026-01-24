import { Router } from "express";
import { UserController } from "../controllers/implementations/user.controller.js";
import { UserRepository } from "../repositories/implementations/user.repository.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { uploadImage } from "../middlewares/file-upload.middleware.js";
import { UserProfileService } from "../services/user-services/user-implementations/userProfile.service.js";
import { UserManagementService } from "../services/user-services/user-implementations/userManagement.service.js";
import { USER_ROUTES } from "../constants/routes.constants.js";
import { UserRole } from "src/constants/roles-and-statuses.js";




// REPOS
const userRepo = new UserRepository();


// SERVICES
const userProfileServices = new UserProfileService(userRepo);
const userManagementServices = new UserManagementService(userRepo);


// CONTROLLER
const userController = new UserController(
    userProfileServices,
    userManagementServices
);



const userRouter = Router();

userRouter.use(authenticate);
userRouter.use(authorize(UserRole.USER, UserRole.HOST, UserRole.ADMIN));




userRouter.get(USER_ROUTES.GET_PROFILE, userController.getUserProfile.bind(userController));
userRouter.patch(USER_ROUTES.EDIT_BASIC_INFO, userController.editUserBasicInfo.bind(userController));
userRouter.put(USER_ROUTES.UPDATE_PROFILE_PIC, uploadImage.single("profileImage"), userController.updateProfilePicture.bind(userController));



export default userRouter;