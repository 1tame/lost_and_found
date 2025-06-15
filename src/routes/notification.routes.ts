import express from 'express';
import {
  getNewClaimCount,
  getUpdatedClaimStatusCount,
  markClaimsAsNotified,
  markClaimantNotificationsSeen,
  markOwnerNotificationsSeen
} from '../controllers/notification.controller';
import { verifyToken } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/owner/new-claims', verifyToken, getNewClaimCount);
router.get('/claimant/status-updates', verifyToken, getUpdatedClaimStatusCount);
router.patch('/claimant/mark-notified', verifyToken, markClaimsAsNotified);
router.put('/claimant/mark-seen', verifyToken, markClaimantNotificationsSeen);
router.put('/owner/mark-seen', verifyToken, markOwnerNotificationsSeen);

export default router;
