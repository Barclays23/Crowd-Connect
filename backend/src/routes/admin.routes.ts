// backend/src/routes/admin.routes.ts

import { Router } from 'express';

// Middlewares
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { uploadDocument, uploadImage } from '../middlewares/file-upload.middleware';


// Repositories ─────────────────
import { UserRepository } from '../repositories/implementations/user.repository';


// ── Initialize Repositories
const userRepo = new UserRepository();





// Services ─────────────────
import { UserServices } from '../services/implementations/user.services';
import { HostServices } from '../services/implementations/host.services';





// ── Initialize Services ──
const userServices = new UserServices(userRepo);
const hostServices = new HostServices(userRepo);




// Controllers ─────────────────
import { UserController } from '../controllers/implementations/user.controller';
import { HostController } from '../controllers/implementations/host.controller';
import { validateBody, validateRequest } from '../middlewares/validate.middleware';
import { HostManageSchema, HostUpgradeSchema } from '../schemas/host.schema';
import { MongoIdParamSchema } from '../schemas/mongo.schema';



// ── Initialize Controllers ──
const userController = new UserController(userServices);
const hostController = new HostController(hostServices);





const adminRouter = Router();



adminRouter.use(authenticate);
adminRouter.use(authorize('admin'));





// User management
adminRouter.get('/users', userController.getAllUsers.bind(userController));
adminRouter.put('/users/:id', uploadImage.single("profileImage"), userController.editUserByAdmin.bind(userController));
adminRouter.delete('/users/:id', userController.deleteUser.bind(userController));
adminRouter.patch('/users/:id/toggle-block', userController.toggleUserBlock.bind(userController));
adminRouter.post('/users', uploadImage.single("profileImage"), userController.createUserByAdmin.bind(userController));


// Host management
adminRouter.get('/hosts', hostController.getAllHosts.bind(hostController));
adminRouter.patch('/hosts/:hostId/manage-host-request', 
    validateRequest({body: HostManageSchema, params: MongoIdParamSchema}), 
    hostController.manageHostStatus.bind(hostController)
);

adminRouter.put('/hosts/:hostId/update-host', 
    uploadDocument.single('hostDocument'), 
    validateRequest({body: HostUpgradeSchema, params: MongoIdParamSchema}), 
    hostController.updateHostByAdmin.bind(hostController)
);

// adminRouter.post('/users/:userId/convert-host',
//     // uploadDocument.single('hostDocument'), validateRequest({body: HostUpgradeSchema}), 
//     // hostController.convertToHost.bind(hostController)
// );


export default adminRouter;