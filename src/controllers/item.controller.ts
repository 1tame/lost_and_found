import { Request, Response } from "express";
import { pool } from '../config/db';
import { Item } from '../interfaces/item.interface';
//import { RowDataPacket } from "mysql2";


//Add item
export const addItem = async (req: Request, res: Response) => {
  try {
    const { item_type, city, status, description } = req.body;

    if (!item_type || !city || !status) {
      return res.status(400).json({ message: "All fields are required!" });
    }

    if (status !== 'Lost' && status !== 'Found') {
      return res.status(400).json({ message: "Status must be 'Lost' or 'Found'" });
    }

    const created_by = (req as any).user.id;

    // 🟡 For lost items: require description
    if (status === 'Lost' && !description) {
      return res.status(400).json({ message: "Description is required for lost items." });
    }

    // 🟡 For lost items: check if image file is provided
    let image = null;
    if (status === 'Lost') {
      if (req.file) {
        image = req.file.filename;
      } else {
        // image is optional, so we allow it to stay null
        image = null;
      }
    }

    const query = `
      INSERT INTO items (item_type, city, status, created_by, description, image)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const values = [
      item_type,
      city,
      status,
      created_by,
      status === 'Lost' ? description : null,
      status === 'Lost' ? image : null,
    ];

    const [result] = await pool.execute(query, values);

    res.status(201).json({
      message: 'Item added successfully',
      item: {
        id: (result as any).insertId,
        item_type,
        city,
        status,
        description: status === 'Lost' ? description : undefined,
        image: status === 'Lost' ? image : undefined,
      },
    });
  } catch (error) {
    console.error('Error adding item:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


// search item /// 

export const searchItem = async (req: Request, res: Response) => {
  try {
    const normalize = (str: string) => str.trim().toLowerCase();
    const item_type = normalize(req.body.item_type || '');
    const city = normalize(req.body.city || '');

    if (!item_type || !city) {
      return res.status(400).json({ message: "Both item type and city are required" });
    }

    const query = `
      SELECT * FROM items 
      WHERE LOWER(item_type) LIKE CONCAT('%', ?, '%') 
        AND LOWER(city) LIKE CONCAT('%', ?, '%') 
        AND status = 'Found'
    `;

    const [result] = await pool.execute(query, [item_type, city]);

    if ((result as any[]).length === 0) {
      return res.status(404).json({ message: "No matching items found" });
    }

    res.status(200).json({
      message: "Items fetched successfully",
      results: result,
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: "Server error" });
  }
};


// Get all lost items
export const getLostItems = async (req: Request, res: Response) => {
  try {
   const query = `
  SELECT 
    items.id AS item_id,
    items.item_type,
    items.city,
    items.description,
    items.image,
    items.created_at,
    users.user_name,
    users.email,
    users.phone
  FROM items
  JOIN users ON items.created_by = users.id
  WHERE items.status = 'Lost'
`;

    const [result] = await pool.execute(query);

    if ((result as any[]).length === 0) {
      return res.status(404).json({ message: "No lost items found" });
    }

    res.status(200).json({
      message: "Lost items fetched successfully",
      items: result,
    });
  } catch (error) {
    console.error("Error fetching lost items:", error);
    res.status(500).json({ message: "Server error" });
  }
};



// DELETE /api/items/:id
export const deleteItem = async (req: Request, res: Response) => {
  const itemId = Number(req.params.id);
  const userId = (req as any).user.id; // Assumes verifyToken adds user info

  try {
    // Optional: Verify item exists and belongs to this user
    const [itemRows] = await pool.query(
      "SELECT * FROM items WHERE id = ? AND created_by = ?",
      [itemId, userId]
    );

    if ((itemRows as any[]).length === 0) {
      return res.status(404).json({ message: "Item not found or not authorized" });
    }

    // Delete the item
    await pool.query("DELETE FROM items WHERE id = ?", [itemId]);

    res.status(200).json({ message: "Item deleted successfully" });
  } catch (err) {
    console.error("Error deleting item:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// controllers/item.controller.ts
export const getMyItems = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;

  try {
    const [rows] = await pool.query(
      `SELECT * FROM items WHERE created_by = ? ORDER BY created_at DESC`,
      [userId]
    );

    res.status(200).json({ items: rows });
  } catch (err) {
    console.error("Error fetching user items:", err);
    res.status(500).json({ message: "Error fetching your items" });
  }
};