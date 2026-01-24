import { Router } from "express";
import { UserRepository } from "../repositories/implementations/user.repository.js";
import { HostController } from "../controllers/implementations/host.controller.js";
import { uploadDocument, uploadImage } from "../middlewares/file-upload.middleware.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { validateRequest } from "../middlewares/validate.middleware.js";
import { HostUpgradeSchema } from "../schemas/host.schema.js";
import { HostManagementServices } from "../services/host-services/host-implementations/HostManagement.service.js";
import { HOST_ROUTES } from "../constants/routes.constants.js";
import { UserRole } from "../constants/roles-and-statuses.js";





// REPOS
const userRepo = new UserRepository();


// SERVICES
const hostManagementServices = new HostManagementServices(userRepo);



// CONTROLLER
const hostController = new HostController(hostManagementServices);




const hostRouter = Router();


hostRouter.post(HOST_ROUTES.APPLY_UPGRADE, authenticate, authorize(UserRole.USER, UserRole.HOST), 
    uploadDocument.single('hostDocument'), validateRequest({body: HostUpgradeSchema}), 
    hostController.applyHostUpgrade.bind(hostController)
);





export default hostRouter;