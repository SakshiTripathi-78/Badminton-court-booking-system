import express from 'express'
import {matchmakingprofile} from '../controllers/matchController.js';

const router = express.Router();

router.post('/matchmakingprofile',matchmakingprofile);
router.get('/getallmatches',getallmatches);
router.get('/matchingprofiles',matchingprofiles);

export default router;