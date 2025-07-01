import { Router } from "express"
import { StrategyController } from "../controllers/StrategyController.ts"
import { validateGetStrategiesQuery, validateStoreStrategyRequest, validateStrategyId } from "../middleware/validator.ts";
import { validateJWT } from "../../shared/middleware/validator.ts";
export const createStrategyRouter = (strategyController: StrategyController): Router => {
    const router = Router()
    router.post('/storeSignedStrategyTxn', validateJWT, validateStoreStrategyRequest, strategyController.storeSignedStrategyTxn.bind(strategyController));

    router.get('/', 
        validateJWT, // Optional: if you want to require auth
        validateGetStrategiesQuery,
        strategyController.getAllUserStrategies.bind(strategyController)
    );

    router.get('/:userStrategyId', 
        validateJWT, // Optional: if you want to require auth
        validateStrategyId,
        strategyController.getUserStrategy.bind(strategyController)
    );

    return router
}