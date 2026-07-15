import express from 'express';
import {bookacourt} from '../controllers/bookingRoutes.js'

const router = express.Router();
router.post('/bookacourt',bookacourt);