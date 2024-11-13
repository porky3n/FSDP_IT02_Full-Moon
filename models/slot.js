const pool = require("../dbConfig");

class Slot {
    constructor(slotID, programmeClassID, programmeID, instanceID, parentID, childID) {
        this.slotID = slotID;
        this.programmeClassID = programmeClassID;
        this.programmeID = programmeID;
        this.instanceID = instanceID;
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
        return rows.map(row => new Slot(row.SlotID, row.ProgrammeClassID, row.ProgrammeID, row.instanceID, row.ParentID, row.ChildID));
    }

    // Get all slots for a specific programme class
    static async getSlotsByProgrammeClass(programmeClassID) {
        const sqlQuery = `
            SELECT * FROM Slot 
            WHERE ProgrammeClassID = ?
        `;
        const [rows] = await pool.query(sqlQuery, [programmeClassID]);
        return rows.map(row => new Slot(row.SlotID, row.ProgrammeClassID, row.ProgrammeID, row.instanceID, row.ParentID, row.ChildID));
    }

    // Get all slots for a specific parent slot
    static async getParentSlots(parentID) {
        const sqlQuery = `
            SELECT * FROM Slot 
            WHERE ParentID = ?
        `;
        const [rows] = await pool.query(sqlQuery, [parentID]);
        return rows.map(row => new Slot(row.SlotID, row.ProgrammeClassID, row.ProgrammeID, row.instanceID, row.ParentID, row.ChildID));
    }

    // Get all slots for a specific child slot
    static async getChildSlots(childID) {
        const sqlQuery = `
            SELECT * FROM Slot 
            WHERE ChildID = ?
        `;
        const [rows] = await pool.query(sqlQuery, [childID]);
        return rows.map(row => new Slot(row.SlotID, row.ProgrammeClassID, row.ProgrammeID, row.instanceID, row.ParentID, row.ChildID));
    }

    // Create a new slot
    static async createSlotAndPayment(
        programmeClassID,
        programmeID,
        instanceID,
        parentID,
        childID,
        paymentAmount,
        paymentMethod,
        paymentImageBase64,
        promotionID
    ) {
        const connection = await pool.getConnection(); 
    
        try {
            await connection.beginTransaction(); 
    
            console.log("Parameters for duplicate check:", programmeClassID, programmeID, instanceID, parentID, childID);
    
            const [duplicateRows] = await connection.query(
                `
                SELECT COUNT(*) AS duplicateCount
                FROM Slot
                WHERE ProgrammeClassID = ? AND ProgrammeID = ? AND InstanceID = ? AND 
                    (ParentID = ? OR (ParentID IS NULL AND ? IS NULL)) AND ChildID = ?
                `,
                [programmeClassID, programmeID, instanceID, parentID, parentID, childID]

            );
    
            // Log the duplicate count for visibility
            console.log("Duplicate count:", duplicateRows);
            console.log("Duplicate count:", duplicateRows[0].duplicateCount);

            if (duplicateRows[0].duplicateCount > 0) {
                throw new Error("Duplicate booking found. This slot has already been booked.");
            }
    
            console.log("Parameters for slot count:", programmeClassID, instanceID);
    
            const [slotCountRows] = await connection.query(
                `
                SELECT COUNT(*) AS currentSlotCount
                FROM Slot
                WHERE ProgrammeClassID = ? AND InstanceID = ?
                `,
                [programmeClassID, instanceID]
            );
    
            const currentSlotCount = slotCountRows[0].currentSlotCount;
    
            const [maxSlotsRows] = await connection.query(
                `
                SELECT MaxSlots
                FROM ProgrammeClass
                WHERE ProgrammeClassID = ?
                `,
                [programmeClassID]
            );
    
            const maxSlots = maxSlotsRows[0].MaxSlots;
    
            if (currentSlotCount >= maxSlots) {
                throw new Error("Slot is full. Cannot create a new slot.");
            }
    
            console.log("Inserting slot with parameters:", programmeClassID, programmeID, instanceID, parentID, childID);
    
            const [slotResult] = await connection.query(
                `
                INSERT INTO Slot (ProgrammeClassID, ProgrammeID, InstanceID, ParentID, ChildID) 
                VALUES (?, ?, ?, ?, ?)
                `,
                [programmeClassID, programmeID, instanceID, parentID, childID]
            );
    
            const slotID = slotResult.insertId;
    
            const paymentImage = Buffer.from(paymentImageBase64, "base64");
    
            console.log("Inserting payment with parameters:", slotID, promotionID, paymentAmount, paymentMethod);
    
            const [paymentResult] = await connection.query(
                `
                INSERT INTO Payment (SlotID, PromotionID, PaymentAmount, PaymentMethod, PaymentImage)
                VALUES (?, ?, ?, ?, ?)
                `,
                [slotID, promotionID, paymentAmount, paymentMethod, paymentImage]
            );
    
            await connection.commit();
    
            return { slotID, paymentID: paymentResult.insertId };
        } catch (error) {
            await connection.rollback(); 
            console.error("Error creating slot and payment:", error);
            throw error;
        } finally {
            connection.release(); 
        }
    }
    
    
    

    // Update slot details (not sure if this is needed)
    static async updateSlot(slotID, programmeClassID, programmeID, instanceID, parentID, childID) {
        const sqlQuery = `
            UPDATE Slot 
            SET ProgrammeClassID = ?, ProgrammeID = ?, instanceID = ?, ParentID = ?, ChildID = ?
            WHERE SlotID = ?
        `;
        await pool.query(sqlQuery, [programmeClassID, programmeID, instanceID, parentID, childID, slotID]);
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



   

