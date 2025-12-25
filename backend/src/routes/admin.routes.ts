// backend/src/routes/admin.routes.ts

import { Router } from 'express';

// Middlewares
import { authenticate, authorize } from '../middlewares/auth.middleware';
// import { uploadProfilePic } from '../middlewares/file-upload.middleware';
import upload from '../middlewares/file-upload.middleware';


// Repositories ─────────────────
import { UserRepository } from '../repositories/implementations/user.repository';
// import { EventRepository } from '../repositories/implementations/event.repository';
// import { BookingRepository } from '../repositories/implementations/booking.repository';
// import { PaymentRepository } from '../repositories/implementations/payment.repository';

// ── Initialize Repositories
const userRepo = new UserRepository();
// const eventRepo = new EventRepository();
// const bookingRepo = new BookingRepository();
// const paymentRepo = new PaymentRepository();




// Services ─────────────────
// import { AdminServices } from '../services/implementations/admin.services';
// import { EventServices } from '../services/implementations/event.services';
import { UserServices } from '../services/implementations/user.services';
// import { BookingServices } from '../services/implementations/booking.services';
// import { PaymentServices } from '../services/implementations/payment.services';




// ── Initialize Services ──
// const eventServices = new EventServices(eventRepo);
const userServices = new UserServices(userRepo);
// const bookingServices = new BookingServices(bookingRepo);
// const paymentServices = new PaymentServices(paymentRepo);
// const adminServices = new AdminServices(
//   userRepo,
//   eventRepo,
//   bookingRepo,
//   paymentRepo
// );



// Controllers ─────────────────
// import { AdminController } from '../controllers/implementations/admin.controller';
import { UserController } from '../controllers/implementations/user.controller';
// import { EventController } from '../controllers/implementations/event.controller';
// import { BookingController } from '../controllers/implementations/booking.controller';
// import { PaymentController } from '../controllers/implementations/payment.controller';


// ── Initialize Controllers ──
// const adminController = new AdminController(adminServices); // Only one dependency → clean, testable, scalable
const userController = new UserController(userServices);
// const eventController = new EventController(eventServices);
// const bookingController = new BookingController(bookingServices);
// const paymentController = new PaymentController(paymentServices);



// ── Router Setup ────────────────────────────────
const adminRouter = Router();


// Protect ALL admin routes: must be logged in + role === 'admin'
adminRouter.use(authenticate);
adminRouter.use(authorize('admin'));





// ── Admin Routes ────────────────────────────────
// adminRouter.get('/dashboard', adminController.getDashboardStats.bind(adminController));



// User management
adminRouter.get('/users', userController.getAllUsers.bind(userController));
adminRouter.put('/users/:id', upload.single("profileImage"), userController.editUserByAdmin.bind(userController));
adminRouter.post('/users', upload.single("profileImage"), userController.createUserByAdmin.bind(userController));
// adminRouter.patch('/users/:id/suspend', userController.suspendUser.bind(userController));
// adminRouter.patch('/users/:id/unsuspend', userController.unsuspendUser.bind(userController));


// Event management
// adminRouter.get('/events', eventController.getAllEvents.bind(eventController));
// adminRouter.patch('/events/:id/approve', eventController.approveEvent.bind(eventController));
// adminRouter.patch('/events/:id/reject', eventController.rejectEvent.bind(eventController));


// Booking management
// adminRouter.get('/bookings', bookingController.getAllBookings.bind(bookingController));
// adminRouter.patch('/bookings/:id/cancel', bookingController.cancelBooking.bind(bookingController));


// Payment management
// adminRouter.get('/payments', paymentController.getAllPayments.bind(paymentController));
// adminRouter.patch('/payouts/:payoutId/approve', paymentController.approvePayout.bind(paymentController));




export default adminRouter;