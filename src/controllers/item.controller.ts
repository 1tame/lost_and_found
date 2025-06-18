import { Request, Response } from "express";
import { pool } from '../config/db';

// Add Item with support for location & image
export const addItem = async (req: Request, res: Response) => {
  try {
    const {
      item_type,
      city,
      status,
      description,
      latitude,
      longitude
    } = req.body;

    // Log for debugging
    console.log("Parsed req.body:", req.body);

    // Validate required
    if (!item_type || !city || !status) {
      return res.status(400).json({ message: "All fields are required!" });
    }

    if (status !== 'Lost' && status !== 'Found') {
      return res.status(400).json({ message: "Status must be 'Lost' or 'Found'" });
    }

    const created_by = (req as any).user.id;

    if (status === 'Lost' && !description) {
      return res.status(400).json({ message: "Description is required for lost items." });
    }

    // 🌍 Location parsing
    const lat = latitude && !isNaN(parseFloat(latitude)) ? parseFloat(latitude) : null;
    const lng = longitude && !isNaN(parseFloat(longitude)) ? parseFloat(longitude) : null;

    // 🖼️ Image
    let image = null;
    if (status === 'Lost' && req.file) {
      image = req.file.filename;
    }

    const query = `
      INSERT INTO items (
        item_type, city, status, created_by,
        description, image, latitude, longitude
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      item_type,
      city,
      status,
      created_by,
      status === 'Lost' ? description : null,
      status === 'Lost' ? image : null,
      lat,
      lng,
    ];

    const [result] = await pool.execute(query, values);

    res.status(201).json({
      message: 'Item added successfully',
      item: {
        id: (result as any).insertId,
        item_type,
        city,
        status,
        description,
        image,
        latitude: lat,
        longitude: lng,
      }
    });
  } catch (error) {
    console.error('Error adding item:', error);
    res.status(500).json({ message: 'Server error while adding item' });
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

//get nearby items
export const getNearbyItems = async (req: Request, res: Response) => {
  const { latitude, longitude } = req.query;

  if (!latitude || !longitude) {
    return res.status(400).json({ message: 'Location required' });
  }

  const lat = parseFloat(latitude as string);
  const lng = parseFloat(longitude as string);
  const radius = 10; // km

  const query = `
    SELECT *, (
      6371 * acos(
        cos(radians(?)) *
        cos(radians(latitude)) *
        cos(radians(longitude) - radians(?)) +
        sin(radians(?)) *
        sin(radians(latitude))
      )
    ) AS distance
    FROM items
    WHERE status = 'Found' AND latitude IS NOT NULL AND longitude IS NOT NULL
    HAVING distance <= ?
    ORDER BY distance ASC
  `;

  try {
    const [rows] = await pool.query(query, [lat, lng, lat, radius]);
    res.status(200).json({ nearby: rows });
  } catch (error) {
    console.error('Error fetching nearby items:', error);
    res.status(500).json({ message: 'Failed to fetch nearby items' });
  }
};



// controllers/itemController.ts

export const getNearbyLostItems = async (req: Request, res: Response) => {
  const { latitude, longitude } = req.query;

  if (!latitude || !longitude) {
    return res.status(400).json({ message: 'Missing location data' });
  }

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
        AND ABS(items.latitude - ?) <= 0.2
        AND ABS(items.longitude - ?) <= 0.2
    `;

    const [result] = await pool.execute(query, [latitude, longitude]);

    if ((result as any[]).length === 0) {
      return res.status(404).json({ message: 'No nearby lost items found' });
    }

    res.status(200).json({
      message: 'Nearby lost items fetched successfully',
      nearbyLost: result,
    });
  } catch (error) {
    console.error('Error fetching nearby lost items:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
