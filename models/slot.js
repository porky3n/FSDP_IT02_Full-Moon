const pool = require("../dbConfig");

class Slot {
    constructor(slotID, programmeClassID, programmeID, parentID, childID) {
        this.slotID = slotID;
        this.programmeClassID = programmeClassID;
        this.programmeID = programmeID;
        this.parentID = parentID;
        this.childID = childID;
    }

    // Get all slots for a specific programme
    // not sure if needed
    static async getSlots(programmeID) {
        const sqlQuery = `
            SELECT * FROM Slot 
            WHERE ProgrammeID = ?
        `;
        const [rows] = await pool.query(sqlQuery, [programmeID]);
        return rows.map(row => new Slot(row.SlotID, row.ProgrammeClassID, row.ProgrammeID, row.ParentID, row.ChildID));
    }

    // Get all slots for a specific programme class
    static async getSlotsByProgrammeClass(programmeClassID) {
        const sqlQuery = `
            SELECT * FROM Slot 
            WHERE ProgrammeClassID = ?
        `;
        const [rows] = await pool.query(sqlQuery, [programmeClassID]);
        return rows.map(row => new Slot(row.SlotID, row.ProgrammeClassID, row.ProgrammeID, row.ParentID, row.ChildID));
    }

    // Get all slots for a specific parent slot
    static async getParentSlots(parentID) {
        const sqlQuery = `
            SELECT * FROM Slot 
            WHERE ParentID = ?
        `;
        const [rows] = await pool.query(sqlQuery, [parentID]);
        return rows.map(row => new Slot(row.SlotID, row.ProgrammeClassID, row.ProgrammeID, row.ParentID, row.ChildID));
    }

    // Get all slots for a specific child slot
    static async getChildSlots(childID) {
        const sqlQuery = `
            SELECT * FROM Slot 
            WHERE ChildID = ?
        `;
        const [rows] = await pool.query(sqlQuery, [childID]);
        return rows.map(row => new Slot(row.SlotID, row.ProgrammeClassID, row.ProgrammeID, row.ParentID, row.ChildID));
    }

    // Create a new slot
    static async createSlot(programmeClassID, programmeID, parentID, childID) {
        const sqlQuery = `
            INSERT INTO Slot (ProgrammeClassID, ProgrammeID, ParentID, ChildID) 
            VALUES (?, ?, ?, ?)
        `;
        const [rows] = await pool.query(sqlQuery, [programmeClassID, programmeID, parentID, childID]);
        return rows.insertId;
    }

    // Update slot details (not sure if this is needed)
    static async updateSlot(slotID, programmeClassID, programmeID, parentID, childID) {
        const sqlQuery = `
            UPDATE Slot 
            SET ProgrammeClassID = ?, ProgrammeID = ?, ParentID = ?, ChildID = ?
            WHERE SlotID = ?
        `;
        await pool.query(sqlQuery, [programmeClassID, programmeID, parentID, childID, slotID]);
    }

    // Delete a slot (not sure if this is needed)
    static async deleteSlot(slotID) {
        const sqlQuery = `
            DELETE FROM Slot 
            WHERE SlotID = ?
        `;
        await pool.query(sqlQuery, [slotID]);
    }
}

module.exports = Slot;



   

