import { Request, Response } from "express";
import { pool } from "../config/db";
import { Claim } from "../interfaces/claim.interface";

//item claiming
export const createClaim = async (req: Request, res: Response) => {
  try {
    const item_id = Number(req.params.item_id);
    const claimant_id = (req as any).user.id; // 👈 Extracted from JWT
    const {
      item_name,
      item_color,
      model,
      special_tag_or_symbol,
      specific_location,
      
    } = req.body;

     const image = req.file?.filename; // 👈 pulled from multer file upload

    if (!item_name || !item_color) {
      return res.status(400).json({ message: "Item name and color are required" });
    }

    const newClaim: Claim = {
      item_id,
      claimant_id,
      item_name,
      item_color,
      model,
      special_tag_or_symbol,
      specific_location,
      image,
    };

    // Check if the user has already claimed this item
    const [existingClaims] = await pool.query(
      `SELECT * FROM claims WHERE item_id = ? AND claimant_id = ?`,
      [item_id, claimant_id]
    );

    if ((existingClaims as any[]).length > 0) {
      return res.status(400).json({ message: "You have already claimed this item" });
    }

    const query = `
      INSERT INTO claims (
        item_id, claimant_id, item_name, item_color,
        model, special_tag_or_symbol, specific_location, image
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      item_id,
      claimant_id,
      item_name,
      item_color,
      model || null,
      special_tag_or_symbol || null,
      specific_location || null,
      image || null,
    ];

    const [result] = await pool.execute(query, values);

    res.status(201).json({
      message: "Claim created successfully",
      claim: { ...newClaim, id: (result as any).insertId },
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating claim", error });
  }
};


///fetching claim 


export const getClaimsForMyItems = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id; // Logged-in user's ID

        const query = `
      SELECT 
        c.id AS claim_id,
        c.status,
        c.created_at,
        c.item_name,
        c.item_color,
        c.model,
        c.special_tag_or_symbol,
        c.specific_location,
        c.image,
        i.item_type,
        u.user_name AS claimant_name,
        u.email AS claimant_email,
        u.phone AS claimant_phone
      FROM claims c
      JOIN items i ON c.item_id = i.id
      JOIN users u ON c.claimant_id = u.id
      WHERE i.created_by = ?
      ORDER BY c.created_at DESC
    `;


    const [rows] = await pool.query(query, [userId]);

    res.status(200).json({ claims: rows });
  } catch (error) {
    console.error('Error fetching claims:', error);
    res.status(500).json({ message: 'Failed to fetch claims for your items' });
  }
};


///Updating status

export const updateClaimStatus = async (req: Request, res: Response) => {
  const { claimId } = req.params;
  const { status } = req.body;
  const userId = (req as any).user.id;

  if (!['Approved', 'Rejected'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status value' });
  }

  try {
    // First, check if the logged-in user owns the item
    const [rows] = await pool.query(
      `SELECT c.*, i.created_by 
       FROM claims c 
       JOIN items i ON c.item_id = i.id 
       WHERE c.id = ?`,
      [claimId]
    );

    const claim = (rows as any)[0];

    if (!claim) {
      return res.status(404).json({ message: 'Claim not found' });
    }

    if (claim.created_by !== userId) {
      return res.status(403).json({ message: 'Not authorized to update this claim' });
    }

    // Update the status
    await pool.query(
      `UPDATE claims SET status = ? WHERE id = ?`,
      [status, claimId]
    );

    // Auto-reject other claims if approved
    if (status === 'Approved') {
      await pool.query(
        `UPDATE claims SET status = 'Rejected' WHERE item_id = ? AND id != ?`,
        [claim.item_id, claimId]
      );
    }

    res.status(200).json({ message: `Claim ${status.toLowerCase()} successfully` });

  } catch (error) {
    console.error('Error updating claim status:', error);
    res.status(500).json({ message: 'Server error while updating claim' });
  }
};


//view claim history
export const getMyClaimHistory = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;

  try {
    const query = `
      SELECT 
        c.id AS claim_id,
        c.status,
        c.created_at,
        i.item_type
        
      FROM claims c
      JOIN items i ON c.item_id = i.id
      WHERE c.claimant_id = ?
      ORDER BY c.created_at DESC
    `;

    const [rows] = await pool.query(query, [userId]);
    res.status(200).json({ claims: rows });
  } catch (error) {
    console.error('Error fetching claim history:', error);
    res.status(500).json({ message: 'Failed to fetch your claim history' });
  }
};




// controllers/claim.controller.ts
export const deleteClaim = async (req: Request, res: Response) => {
  const { claimId } = req.params;
  const userId = (req as any).user.id;

  try {
    const [rows] = await pool.query(
      `SELECT * FROM claims WHERE id = ? AND claimant_id = ?`,
      [claimId, userId]
    );

    if ((rows as any).length === 0) {
      return res.status(404).json({ message: "Claim not found or not yours" });
    }

    await pool.query(`DELETE FROM claims WHERE id = ?`, [claimId]);

    res.status(200).json({ message: "Claim deleted successfully" });
  } catch (error) {
    console.error("Error deleting claim:", error);
    res.status(500).json({ message: "Server error while deleting claim" });
  }
};
