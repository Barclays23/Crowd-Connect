// backend/src/routes/admin.routes.ts

import { Router } from 'express';

// Middlewares
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { uploadImage } from '../middlewares/file-upload.middleware';


// Repositories ─────────────────
import { UserRepository } from '../repositories/implementations/user.repository';


// ── Initialize Repositories
const userRepo = new UserRepository();





// Services ─────────────────
import { UserServices } from '../services/implementations/user.services';





// ── Initialize Services ──
const userServices = new UserServices(userRepo);




// Controllers ─────────────────
import { UserController } from '../controllers/implementations/user.controller';



// ── Initialize Controllers ──
const userController = new UserController(userServices);





const adminRouter = Router();



adminRouter.use(authenticate);
adminRouter.use(authorize('admin'));





// User management
adminRouter.get('/users', userController.getAllUsers.bind(userController));
adminRouter.put('/users/:id', uploadImage.single("profileImage"), userController.editUserByAdmin.bind(userController));
adminRouter.post('/users', uploadImage.single("profileImage"), userController.createUserByAdmin.bind(userController));



export default adminRouter;