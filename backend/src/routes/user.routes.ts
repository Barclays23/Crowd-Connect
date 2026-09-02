import { Router } from "express";
import { authenticate, authorize } from "@/middlewares/auth.middleware";
import { uploadImage } from "@/middlewares/file-upload.middleware";
import { USER_ROUTES } from "@/constants/routes.constants";
import { USER_ROLES } from "@/constants/user-system.constants";
import { validateBody } from "@/middlewares/validate.middleware";
import { changePasswordSchema } from "@/schemas/user.schema";
import { userController } from "@/container/dependencies";





const userRouter = Router();

userRouter.use(authenticate);
userRouter.use(authorize(USER_ROLES.USER, USER_ROLES.HOST, USER_ROLES.ADMIN));




userRouter.get(USER_ROUTES.GET_PROFILE, userController.getUserProfile.bind(userController));
userRouter.patch(USER_ROUTES.BASIC_INFO, userController.editUserBasicInfo.bind(userController));
userRouter.patch(USER_ROUTES.CHANGE_PASSWORD, validateBody(changePasswordSchema), userController.changeUserPassword.bind(userController));
userRouter.put(USER_ROUTES.UPDATE_PROFILE_PIC, uploadImage.single("profileImage"), userController.updateProfilePicture.bind(userController));



export default userRouter;