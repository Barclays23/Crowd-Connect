import { Router } from "express";
import { UserRepository } from "../repositories/implementations/user.repository";
import { UserServices } from "../services/implementations/user.services";
import { HostServices } from "../services/implementations/host.services";
import { HostController } from "../controllers/implementations/host.controller";


const hostRouter = Router();


const userRepo = new UserRepository();
const hostServices = new HostServices(userRepo);
const hostController = new HostController(hostServices);


hostRouter.post('/apply-upgrade', hostController.applyHostUpgrade.bind(hostController));


export default hostRouter;