import { Router } from "express"
import { StrategyController } from "../controllers/StrategyController.ts"
export const createStrategyRouter = (strategyController: StrategyController): Router => {
    const router = Router()
    router.post('/storeSignedStrategyTxn', strategyController.storeSignedStrategyTxn.bind(strategyController));

    return router
}