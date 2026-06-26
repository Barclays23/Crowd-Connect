import { Router } from "express";
import { UserController } from "@/controllers/implementations/user.controller";
import { UserRepository } from "@/repositories/implementations/user.repository";
import { authenticate, authorize } from "@/middlewares/auth.middleware";
import { uploadImage } from "@/middlewares/file-upload.middleware";
import { UserProfileService } from "@/services/user-services/implementations/userProfile.service";
import { UserManagementService } from "@/services/user-services/implementations/userManagement.service";
import { USER_ROUTES } from "@/constants/routes.constants";
import { USER_ROLES } from "@/constants/user-system.constants";
import { PasswordService } from "@/services/password-services/implementations/password.service";
import { validateBody } from "@/middlewares/validate.middleware";
import { changePasswordSchema } from "@/schemas/user.schema";
import { RedisCacheService } from "@/services/cache-services/implementations/redisCache.service";




// REPOS
const userRepo = new UserRepository();


// SERVICES
const userProfileServices       = new UserProfileService(userRepo);
const userManagementServices    = new UserManagementService(userRepo);
const cacheService              = new RedisCacheService();
const passwordService           = new PasswordService(userRepo, cacheService);


// CONTROLLER
const userController = new UserController(
    userProfileServices,
    userManagementServices,
    passwordService
);



const userRouter = Router();

userRouter.use(authenticate);
userRouter.use(authorize(USER_ROLES.USER, USER_ROLES.HOST, USER_ROLES.ADMIN));




userRouter.get(USER_ROUTES.GET_PROFILE, userController.getUserProfile.bind(userController));
userRouter.patch(USER_ROUTES.EDIT_BASIC_INFO, userController.editUserBasicInfo.bind(userController));
userRouter.patch(USER_ROUTES.CHANGE_PASSWORD, validateBody(changePasswordSchema), userController.changeUserPassword.bind(userController));
userRouter.put(USER_ROUTES.UPDATE_PROFILE_PIC, uploadImage.single("profileImage"), userController.updateProfilePicture.bind(userController));



export default userRouter;