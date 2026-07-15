import {venues} from '../controllers/venueController.js';
import express from 'express';

const router=express.Router();

router.post('/venues',venues);

export default router;