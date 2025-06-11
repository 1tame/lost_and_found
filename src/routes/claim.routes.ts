import express from "express";
import { createClaim, getClaimsForMyItems, updateClaimStatus, getMyClaimHistory, deleteClaim } from "../controllers/claim.controller";
import { verifyToken } from "../middleware/authMiddleware";
import upload from "../middleware/uploadMiddleware";

const router = express.Router();

router.post("/:item_id/add", verifyToken, upload.single('image') ,createClaim);
router.get("/view", verifyToken, getClaimsForMyItems);
router.put('/:claimId/status', verifyToken, updateClaimStatus);
router.get('/my-claims', verifyToken, getMyClaimHistory );
router.delete('/delete/:claimId', verifyToken, deleteClaim);

export default router;
