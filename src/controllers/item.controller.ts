import { Request, Response } from "express";
import { pool } from '../config/db';
import { Item } from '../interfaces/item.interface';
//import { RowDataPacket } from "mysql2";


//Add item
export const addItem = async (req:Request, res:Response)=>{
    try{
        const {item_type, city, status} = req.body;

        if(!item_type || !city || !status){
            return res.status(400).json({message: "All fields are required!"});
        }

        if(status !='Lost' && status !='Found'){
            return res.status(400).json({message: " status must be 'Lost' or 'Found'"});
        }

        const created_by =  (req as any).user.id;

    const newItem: Item = {
        item_type,
        city,
        status
    };

    const query = `INSERT INTO items (item_type, city, status)
                   VALUES (?, ?, ?)`;

    const values = [newItem.item_type, newItem.city, newItem.status];

               const [result] = await pool.execute(query, values);

               res.status(201).json({
                message: 'Item added successfully',
                item: { ...newItem, id: (result as any).insertId}
               });
    }catch(error){
        console.error(error);
        res.status(500).json({ message: 'Server error'});
    }
};


// search item /// 

export const searchItem = async (req: Request, res: Response) => {
  try {
    const { item_type, city } = req.body;

    if (!item_type || !city) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const query = `
      SELECT * FROM items 
      WHERE LOWER(item_type) = LOWER(?) 
        AND LOWER(city) = LOWER(?) 
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
    res.status(500).json({ message: "Server error" });
  }
};


// Get all lost items
export const getLostItems = async (req: Request, res: Response) => {
  try {
    const query = `
      SELECT * FROM items 
      WHERE status = 'Lost'
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
