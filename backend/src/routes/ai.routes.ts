// backend/src/routes/ai.routes.ts
import { Router } from 'express';
import { validateRequest } from '@/middlewares/validate.middleware';
import { authenticate, authorize } from '@/middlewares/auth.middleware';
import { GeneratePosterSchema } from '@/schemas/ai.schema';
import { USER_ROLES } from '@/constants/user-system.constants';
import { AI_ROUTES } from '@/constants/routes.constants';
import { aiController } from '@/container/dependencies';






const aiRouter = Router();



aiRouter.post(
    AI_ROUTES.GENERATE_EVENT_POSTER,
    authenticate, authorize(USER_ROLES.HOST, USER_ROLES.ADMIN),
    validateRequest({ body: GeneratePosterSchema }),
    aiController.generateEventPoster.bind(aiController)
);





export default aiRouter;