import { Request, Response } from "express";
import { pool } from '../config/db';
import { Item } from '../interfaces/item.interface';



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

        //const created_by = req.user?.id;

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