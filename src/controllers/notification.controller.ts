import { Request, Response } from "express";
import { pool } from "../config/db";

// ✅ New claims (for owners)
export const getNewClaimCount = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  try {
    const [rows] = await pool.query(
      `SELECT COUNT(*) AS count
       FROM claims c
       JOIN items i ON c.item_id = i.id
       WHERE i.created_by = ? AND c.status = 'Pending' AND c.seen_by_owner = FALSE`,
      [userId]
    );
    const count = (rows as any)[0].count;
    res.status(200).json({ newClaimCount: count });
  } catch (err) {
    console.error("Error fetching new claim count:", err);
    res.status(500).json({ message: "Error fetching notifications" });
  }
};

// ✅ Updated claims (for claimants)
export const getUpdatedClaimStatusCount = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  try {
    const [rows] = await pool.query(
      `SELECT COUNT(*) AS count
       FROM claims
       WHERE claimant_id = ? AND status IN ('Approved', 'Rejected') AND seen_by_claimant = FALSE`,
      [userId]
    );
    const count = (rows as any)[0].count;
    res.status(200).json({ updatedClaimCount: count });
  } catch (err) {
    console.error("Error fetching updated claim count:", err);
    res.status(500).json({ message: "Error fetching notifications" });
  }
};

// ✅ Mark claims as notified (not used in badge count)
export const markClaimsAsNotified = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  try {
    await pool.query(
      `UPDATE claims
       SET notified = 1
       WHERE claimant_id = ? AND status IN ('Approved', 'Rejected')`,
      [userId]
    );
    res.status(200).json({ message: "Claims marked as notified" });
  } catch (err) {
    console.error("Error marking claims as notified:", err);
    res.status(500).json({ message: "Failed to update claim notifications" });
  }
};

// ✅ Claimant sees status update badge
export const markClaimantNotificationsSeen = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  try {
    await pool.query(
      `UPDATE claims
       SET seen_by_claimant = TRUE
       WHERE claimant_id = ? AND seen_by_claimant = FALSE AND status IS NOT NULL`,
      [userId]
    );
    res.status(200).json({ message: "Claimant notifications marked as seen." });
  } catch (err) {
    console.error("Error marking claimant notifications:", err);
    res.status(500).json({ message: "Server error marking claimant notifications." });
  }
};

// ✅ Owner sees new claim badge
export const markOwnerNotificationsSeen = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  try {
    await pool.query(
      `UPDATE claims c
       JOIN items i ON c.item_id = i.id
       SET c.seen_by_owner = TRUE
       WHERE i.created_by = ? AND c.seen_by_owner = FALSE`,
      [userId]
    );
    res.status(200).json({ message: "Owner notifications marked as seen." });
  } catch (err) {
    console.error("Error marking owner notifications:", err);
    res.status(500).json({ message: "Server error marking owner notifications." });
  }
};
