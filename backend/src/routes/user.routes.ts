import { Router } from "express";
import { UserController } from "@/controllers/implementations/user.controller";
import { UserRepository } from "@/repositories/implementations/user.repository";
import { authenticate, authorize } from "@/middlewares/auth.middleware";
import { uploadImage } from "@/middlewares/file-upload.middleware";
import { UserProfileService } from "@/services/user-services/implementations/userProfile.service";
import { UserManagementService } from "@/services/user-services/implementations/userManagement.service";
import { USER_ROUTES } from "@/constants/routes.constants";
import { UserRole } from "@/constants/roles-and-statuses";




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