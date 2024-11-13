const pool = require("../dbConfig");

class ProgrammeClass {
    constructor(programmeClassID, programmeID, shortDescription, location, fee, maxSlots, programmeLevel, remarks) {
        this.programmeClassID = programmeClassID;
        this.programmeID = programmeID;
        this.shortDescription = shortDescription;
        this.location = location;
        this.fee = fee;
        this.maxSlots = maxSlots;
        this.programmeLevel = programmeLevel;
        this.remarks = remarks;
    }

    // Get all programme classes
    static async getAllProgrammeClasses() {
        const sqlQuery = `
            SELECT 
                ProgrammeClassID, 
                ProgrammeID, 
                ShortDescription,
                Location, 
                Fee, 
                MaxSlots, 
                ProgrammeLevel, 
                Remarks
            FROM ProgrammeClass
        `;

        try {
            const [rows] = await pool.query(sqlQuery);
            return rows.map(row => new ProgrammeClass(
                row.ProgrammeClassID,
                row.ProgrammeID,
                row.ShortDescription,
                row.Location,
                row.Fee,
                row.MaxSlots,
                row.ProgrammeLevel,
                row.Remarks || ''
            ));
        } catch (error) {
            console.error("Error fetching all programme classes:", error);
            throw error;
        }
    }

    // Get classes for a specific programme with additional details
    static async getProgrammeClasses(programmeID) {
        const sqlQuery = `
            SELECT 
                ProgrammeClassID, 
                ProgrammeID, 
                ShortDescription,
                Location, 
                Fee, 
                MaxSlots, 
                ProgrammeLevel, 
                Remarks
            FROM ProgrammeClass
            WHERE ProgrammeID = ?
        `;

        try {
            const [rows] = await pool.query(sqlQuery, [programmeID]);
            
            return rows.map(row => ({
                programmeClassID: row.ProgrammeClassID,
                programmeID: row.ProgrammeID,
                shortDescription: row.ShortDescription,
                location: row.Location,
                fee: row.Fee,
                maxSlots: row.MaxSlots,
                programmeLevel: row.ProgrammeLevel,
                remarks: row.Remarks || ''
            }));
        } catch (error) {
            console.error("Error fetching programme classes:", error);
            throw error;
        }
    }

    static async getProgrammeCartDetails(programmeClassID) {
        const sqlQuery = `
          SELECT 
            p.ProgrammeID,
            p.ProgrammeName,
            pc.Fee AS originalFee,
            pr.PromotionID,
            pr.PromotionName,
            pr.DiscountType,
            pr.DiscountValue,
            CASE
              WHEN pr.DiscountType = 'Percentage' THEN pc.Fee * (1 - pr.DiscountValue / 100)
              WHEN pr.DiscountType = 'Fixed Amount' THEN pc.Fee - pr.DiscountValue
              ELSE pc.Fee
            END AS discountedFee
          FROM 
            Programme p
          JOIN ProgrammeClass pc ON p.ProgrammeID = pc.ProgrammeID
          LEFT JOIN Promotion pr ON p.ProgrammeID = pr.ProgrammeID
            AND pr.StartDateTime <= NOW() 
            AND pr.EndDateTime >= NOW()
          WHERE 
            pc.ProgrammeClassID = ?
        `;
    
        try {
            const [rows] = await pool.query(sqlQuery, [programmeClassID]);
    
            if (rows.length === 0) {
                return null; // Return null if no data is found
            }
    
            const row = rows[0];
            return {
                programmeID: row.ProgrammeID,
                programmeName: row.ProgrammeName,
                originalFee: row.originalFee,
                promotionID: row.PromotionID || null,
                discountedFee: row.discountedFee,
                promotionName: row.PromotionName || null,
                discountType: row.DiscountType || null,
                discountValue: row.DiscountValue || null
            };
        } catch (error) {
            console.error("Error fetching programme cart details:", error);
            throw error;
        }
    }
    
    // Create a new programme class entry
    static async createProgrammeClass({ programmeID, shortDescription, location, fee, maxSlots, level, remarks }) {
        const sqlQuery = `
            INSERT INTO ProgrammeClass 
            (ProgrammeID, ShortDescription, Location, Fee, MaxSlots, ProgrammeLevel, Remarks)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
    
        try {
            const [result] = await pool.query(sqlQuery, [
                programmeID,
                shortDescription,
                location,
                fee,
                maxSlots,
                level,
                remarks
            ]);
            return result.insertId; // Returns the ID of the new programme class
        } catch (error) {
            console.error("Error creating programme class:", error);
            throw error;
        }
    }
    // Get fee information for a specific programme class
    // static async getSpecificProgrammeClass(programmeID, programmeClassID) {
    //     const sqlQuery = `
    //     SELECT * FROM ProgrammeClass 
    //     WHERE ProgrammeID = ? AND ProgrammeClassID = ?`;
    //     const [rows] = await pool.query(sqlQuery, [programmeID, programmeClassID]);
    //     return rows.length ? rows[0].Fee : null;
    // }
}

module.exports = ProgrammeClass;