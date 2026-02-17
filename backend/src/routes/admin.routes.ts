// backend/src/routes/admin.routes.ts

import { Router } from 'express';

import { authenticate, authorize } from '@/middlewares/auth.middleware';
import { uploadDocument, uploadImage } from '@/middlewares/file-upload.middleware';

import { UserRepository } from '@/repositories/implementations/user.repository';

import { UserManagementService } from '@/services/user-services/implementations/userManagement.service';
import { UserProfileService } from '@/services/user-services/implementations/userProfile.service';
import { HostManagementServices } from '@/services/host-services/implementations/HostManagement.service';

import { UserController } from '@/controllers/implementations/user.controller';
import { HostController } from '@/controllers/implementations/host.controller';


import { validateBody, validateRequest } from '@/middlewares/validate.middleware';
import { HostManageSchema, HostUpgradeSchema } from '@/schemas/host.schema';
import { MongoIdParamSchema } from '@/schemas/mongo.schema';
import { ADMIN_ROUTES, EVENT_ROUTES } from '@/constants/routes.constants';
import { UserRole } from '@/constants/roles-and-statuses';
import { EventManagementServices } from '@/services/event-services/implementations/eventManagement.service';
import { EventRepository } from '@/repositories/implementations/event.repository';
import { EventController } from '@/controllers/implementations/event.controller';






// ── Initialize REPOSITORIES
const userRepo = new UserRepository();
const eventRepo = new EventRepository();




// ── Initialize SERVICES
const userManagementServices = new UserManagementService(userRepo);
const userProfileServices = new UserProfileService(userRepo);
const hostManagementServices = new HostManagementServices(userRepo);
const eventManagementServices = new EventManagementServices(eventRepo);




// ── Initialize CONTROLLERS ──
const userController = new UserController(userProfileServices, userManagementServices);
const hostController = new HostController(hostManagementServices);
const eventController = new EventController(eventManagementServices);




const adminRouter = Router();



adminRouter.use(authenticate);
adminRouter.use(authorize(UserRole.ADMIN));





// User management
adminRouter.get(ADMIN_ROUTES.GET_USERS, userController.getAllUsers.bind(userController));
adminRouter.put(ADMIN_ROUTES.EDIT_USER, uploadImage.single("profileImage"), userController.editUserByAdmin.bind(userController));
adminRouter.delete(ADMIN_ROUTES.DELETE_USER, userController.deleteUser.bind(userController));
adminRouter.patch(ADMIN_ROUTES.TOGGLE_BLOCK_USER, userController.toggleUserBlock.bind(userController));
adminRouter.post(ADMIN_ROUTES.CREATE_USER, uploadImage.single("profileImage"), userController.createUserByAdmin.bind(userController));


// Host management
adminRouter.get(ADMIN_ROUTES.GET_HOSTS, hostController.getAllHosts.bind(hostController));
adminRouter.patch(ADMIN_ROUTES.MANAGE_HOST_REQUEST, 
    validateRequest({body: HostManageSchema, params: MongoIdParamSchema}), 
    hostController.manageHostStatus.bind(hostController)
);
adminRouter.put(ADMIN_ROUTES.UPDATE_HOST, 
    uploadDocument.single('hostDocument'), 
    validateRequest({body: HostUpgradeSchema, params: MongoIdParamSchema}), 
    hostController.updateHostByAdmin.bind(hostController)
);

// adminRouter.post('/users/:userId/convert-host',
//     // uploadDocument.single('hostDocument'), validateRequest({body: HostUpgradeSchema}), 
//     // hostController.convertToHost.bind(hostController)
// );




// event management
adminRouter.get(ADMIN_ROUTES.GET_EVENTS, eventController.getAllEvents.bind(eventController));
adminRouter.patch(ADMIN_ROUTES.SUSPEND_EVENT, eventController.suspendEvent.bind(eventController));
adminRouter.delete(ADMIN_ROUTES.DELETE_EVENT, eventController.deleteEvent.bind(eventController));


export default adminRouter;