import { Router } from "express";
import { UserRepository } from "../repositories/implementations/user.repository";
import { HostController } from "../controllers/implementations/host.controller";
import { uploadDocument, uploadImage } from "../middlewares/file-upload.middleware";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validateRequest } from "../middlewares/validate.middleware";
import { HostUpgradeSchema } from "../schemas/host.schema";
import { HostManagementServices } from "../services/host-services/host-implementations/HostManagement.service";
import { HOST_ROUTES } from "../constants/routes.constants";





// REPOS
const userRepo = new UserRepository();


// SERVICES
const hostManagementServices = new HostManagementServices(userRepo);



// CONTROLLER
const hostController = new HostController(hostManagementServices);




const hostRouter = Router();


hostRouter.post(HOST_ROUTES.APPLY_UPGRADE, authenticate, authorize('user', 'host'), 
    uploadDocument.single('hostDocument'), validateRequest({body: HostUpgradeSchema}), 
    hostController.applyHostUpgrade.bind(hostController)
);





export default hostRouter;