import { Router } from "express";
import { UserRepository } from "../repositories/implementations/user.repository";
import { UserServices } from "../services/implementations/user.services";
import { HostServices } from "../services/implementations/host.services";
import { HostController } from "../controllers/implementations/host.controller";
import { uploadDocument, uploadImage } from "../middlewares/file-upload.middleware";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validateRequest } from "../middlewares/validate.middleware";
import { HostUpgradeSchema } from "../schemas/host.schema";


const hostRouter = Router();


const userRepo = new UserRepository();
const hostServices = new HostServices(userRepo);
const hostController = new HostController(hostServices);


hostRouter.post('/apply-upgrade', authenticate, authorize('user', 'host'), 
    uploadDocument.single('hostDocument'), validateRequest({body: HostUpgradeSchema}), 
    hostController.applyHostUpgrade.bind(hostController)
);





export default hostRouter;