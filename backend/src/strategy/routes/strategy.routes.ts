import { Router } from "express"
import { StrategyController } from "../controllers/StrategyController.ts"
import { validateStoreStrategyRequest } from "../middleware/validator.ts";
import { validateJWT } from "../../shared/middleware/validator.ts";
export const createStrategyRouter = (strategyController: StrategyController): Router => {
    const router = Router()
    router.post('/storeSignedStrategyTxn', validateJWT, validateStoreStrategyRequest, strategyController.storeSignedStrategyTxn.bind(strategyController));

    return router
}