import {venues} from '../controllers/venueController.js';
import {addcourt} from '../controllers/venueController.js';
import {venueswithcourt} from '../controllers/venueController.js';
import express from 'express';

const router=express.Router();

router.post('/venues',venues);
router.post('/addcourt',addcourt);
router.get('venueswithcourt',venueswithcourt);

export default router;