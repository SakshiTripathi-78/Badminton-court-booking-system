import express from 'express';
import {newmatchchallenge} from '../controllers/challengeController.js';
import {pendingchallenge} from '../controllers/challengeController.js';

const router = express.Router();

router.post('/newmatchchallenge',newmatchchallenge);
router.get('/pending/:userId',pendingchallenge);

export default router;
