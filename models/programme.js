// const dbConfig = require('../dbConfig'); // Ensure this uses the pooled connection

//     class Programme {
//         constructor(programmeID, programmeName, category, location, description, startDate, endDate, fee, maxSlots, programmeLevel) {
//             this.programmeID = programmeID;
//             this.programmeName = programmeName;
//             this.category = category;
//             this.location = location;
//             this.description = description;
//             this.startDate = startDate;
//             this.endDate = endDate;
//             this.fee = fee;
//             this.maxSlots = maxSlots;
//             this.programmeLevel = programmeLevel;
//         }

//         // Get all programmes
//         static async getAllProgrammes() {
//             const sqlQuery = `SELECT * FROM Programme`;
            
//             try {
//                 const [rows] = await dbConfig.query(sqlQuery); // Executes query using the pooled connection

//                 return rows.map(
//                     (row) => new Programme(
//                         row.ProgrammeID,
//                         row.ProgrammeName,
//                         row.Category,
//                         row.Location,
//                         row.Description,
//                         row.StartDate,
//                         row.EndDate,
//                         row.Fee,
//                         row.MaxSlots,
//                         row.ProgrammeLevel
//                     )
//                 );
//             } catch (error) {
//                 console.error("Database query error:", error);
//                 throw error;
//             }
//         }

//         static async getProgrammeByID(programmeID) {
//             const sqlQuery = `SELECT * FROM Programme WHERE ProgrammeID = ?`;

//             try {
//                 const [rows] = await dbConfig.query(sqlQuery, [programmeID]);
//                 if (rows.length === 0) {
//                     return null;
//                 }

//                 const row = rows[0];
//                 return new Programme(row.ProgrammeID, row.ProgrammeName,
//                 row.Category, row.Location, row.Description, row.StartDate,
//                 row.EndDate,row.Fee,row.MaxSlots,row.ProgrammeLevel
//                 );
//             } catch (error) {
//                 console.error("Database query error:", error);
//                 throw error;
//             }
//         }

//     // Get featured programmes based on criteria (e.g., soonest start date)
//     // What should i based it on? the number of ppl who signed up?
//     // SELECT p.*
//     // FROM Programme p
//     // LEFT JOIN Signups s ON p.ProgrammeID = s.ProgrammeID
//     // GROUP BY p.ProgrammeID
//     // ORDER BY COUNT(s.UserID) DESC
//     // LIMIT 5;

//     static async getFeaturedProgrammes() {
//         // Selecting upcoming programs with the soonest start dates
//         const sqlQuery = `
//             SELECT * FROM Programme
//             WHERE StartDate > NOW()
//             ORDER BY StartDate ASC
//             LIMIT 5;
//         `;

//         try {
//             const [rows] = await dbConfig.query(sqlQuery);
//             return rows.map(row => new Programme(
//                 row.ProgrammeID, row.ProgrammeName, row.Category, row.Location,
//                 row.Description, row.StartDate, row.EndDate, row.Fee,
//                 row.MaxSlots, row.ProgrammeLevel
//             ));
//         } catch (error) {
//             console.error("Database query error:", error);
//             throw error;
//         }
//     }

//     // Get programmes by category for popular category section
//     static async getProgrammesByCategory(category) {
//         const sqlQuery = `
//             SELECT * FROM Programme 
//             WHERE Category = ?
//             ORDER BY StartDate DESC`;
        
//         try {
//             const [rows] = await dbConfig.query(sqlQuery, [category]);
//             return rows.map(row => new Programme(
//                 row.ProgrammeID, row.ProgrammeName, row.Category, row.Location,
//                 row.Description, row.StartDate, row.EndDate, row.Fee,
//                 row.MaxSlots, row.ProgrammeLevel
//             ));
//         } catch (error) {
//             console.error("Database query error:", error);
//             throw error;
//         }
//     }

//     // Search programmes based on keyword
//     static async searchProgrammes(keyword) {
//         const sqlQuery = `
//             SELECT * FROM Programme
//             WHERE ProgrammeName LIKE ? 
//             OR Description LIKE ? 
//         `;
        
//         try {
//             const [rows] = await dbConfig.query(sqlQuery, [`%${keyword}%`, `%${keyword}%`, `%${keyword}%`]);
//             return rows.map(row => new Programme(
//                 row.ProgrammeID, row.ProgrammeName, row.Category, row.Location,
//                 row.Description, row.StartDate, row.EndDate, row.Fee,
//                 row.MaxSlots, row.ProgrammeLevel
//             ));
//         } catch (error) {
//             console.error("Database query error:", error);
//             throw error;
//         }
//     }

//     // Get a single programme by ID
//     static async getProgrammeByID(programmeID) {
//         const sqlQuery = `
//             SELECT * FROM Programme 
//             WHERE ProgrammeID = ?`;

//         try {
//             const [rows] = await dbConfig.query(sqlQuery, [programmeID]);
//             if (rows.length === 0) {
//                 return null;
//             }

//             const row = rows[0];
//             return new Programme(
//                 row.ProgrammeID, row.ProgrammeName, row.Category, row.Location,
//                 row.Description, row.StartDate, row.EndDate, row.Fee,
//                 row.MaxSlots, row.ProgrammeLevel
//             );
//         } catch (error) {
//             console.error("Database query error:", error);
//             throw error;
//         }
//     }


//     // Create a new programme
//     // static async createProgramme(programmeData) {
//     //     const connection = await sql.connect(dbConfig);
//     //     const sqlQuery = `INSERT INTO Programme (ProgrammeName, Category, Location, Description, StartDate, EndDate, Fee, MaxSlots, ProgrammeLevel)
//     //                       VALUES (@programmeName, @category, @location, @description, @startDate, @endDate, @fee, @maxSlots, @programmeLevel);
//     //                       SELECT SCOPE_IDENTITY() AS ProgrammeID;`;

//     //     const request = connection.request();
//     //     request.input('programmeName', sql.VarChar, programmeData.programmeName);
//     //     request.input('category', sql.VarChar, programmeData.category);
//     //     request.input('location', sql.VarChar, programmeData.location);
//     //     request.input('description', sql.Text, programmeData.description);
//     //     request.input('startDate', sql.Date, programmeData.startDate);
//     //     request.input('endDate', sql.Date, programmeData.endDate);
//     //     request.input('fee', sql.Decimal(10, 2), programmeData.fee);
//     //     request.input('maxSlots', sql.Int, programmeData.maxSlots);
//     //     request.input('programmeLevel', sql.VarChar, programmeData.programmeLevel);

//     //     const result = await request.query(sqlQuery);
//     //     connection.close();

//     //     return result.recordset[0].ProgrammeID;
//     // }
// }

// module.exports = Programme;


// ver 2.0
const pool = require("../dbConfig");

class Programme {
    constructor(programmeID, programmeName, category, programmePictureURL, description) {
        this.programmeID = programmeID;
        this.programmeName = programmeName;
        this.category = category;
        this.programmePictureURL = programmePictureURL;
        this.description = description;
    }

    // Get all programmes
    static async getAllProgrammes() {
        const sqlQuery = `SELECT * FROM Programme`;
        const [rows] = await pool.query(sqlQuery);
        return rows.map(row => new Programme(
            row.ProgrammeID,
            row.ProgrammeName,
            row.Category,
            row.ProgrammePictureURL,
            row.Description
        ));
    }

    // Get programme by ID
    static async getProgrammeByID(programmeID) {
        const sqlQuery = `SELECT * FROM Programme WHERE ProgrammeID = ?`;
        const [rows] = await pool.query(sqlQuery, [programmeID]);

        if (rows.length === 0) return null;
        const row = rows[0];
        return new Programme(
            row.ProgrammeID,
            row.ProgrammeName,
            row.Category,
            row.ProgrammePictureURL,
            row.Description
        );
    }

    // Get featured programmes (customize selection criteria as needed)
    static async getFeaturedProgrammes() {
        const sqlQuery = `
            SELECT * FROM Programme
            ORDER BY ProgrammeID DESC
            LIMIT 5;
        `;
        const [rows] = await pool.query(sqlQuery);
        return rows.map(row => new Programme(
            row.ProgrammeID,
            row.ProgrammeName,
            row.Category,
            row.ProgrammePictureURL,
            row.Description
        ));
    }

    // Get programmes by category with optional exclusion and limit
    static async getProgrammesByCategory(category, excludeProgrammeID = null, limit = null) {
        let sqlQuery = `SELECT * FROM Programme WHERE Category = ?`;
        const params = [category];

        if (excludeProgrammeID) {
            sqlQuery += ` AND ProgrammeID != ?`;
            params.push(excludeProgrammeID);
        }

        sqlQuery += ` ORDER BY ProgrammeID DESC`;
        
        if (limit) {
            sqlQuery += ` LIMIT ?`;
            params.push(limit);
        }

        const [rows] = await pool.query(sqlQuery, params);
        return rows.map(row => new Programme(
            row.ProgrammeID,
            row.ProgrammeName,
            row.Category,
            row.ProgrammePictureURL,
            row.Description
        ));
    }

    // Search programmes by keyword in ProgrammeName or Description
    static async searchProgrammes(keyword) {
        const sqlQuery = `
            SELECT * FROM Programme
            WHERE ProgrammeName LIKE ? OR Description LIKE ?
        `;
        const [rows] = await pool.query(sqlQuery, [`%${keyword}%`, `%${keyword}%`]);
        return rows.map(row => new Programme(
            row.ProgrammeID,
            row.ProgrammeName,
            row.Category,
            row.ProgrammePictureURL,
            row.Description
        ));
    }
}

module.exports = Programme;


//     // Method to get schedules for a specific programme
//     static async getUpcomingSchedules(programmeId) {
//         const sqlQuery = `
//             SELECT ScheduleID, Level, StartDate, EndDate, StartTime, EndTime, MaxSlots
//             FROM ProgrammeSchedule
//             WHERE ProgrammeID = ? AND StartDate >= NOW()
//             ORDER BY StartDate
//         `;
//         const [rows] = await pool.query(sqlQuery, [programmeId]);
//         return rows;
//     }

//     // Method to get fees for a specific programme
//     static async getProgrammeFees(programmeId) {
//         const sqlQuery = `
//             SELECT FeeID, FeeType, Price, OriginalPrice, Benefits
//             FROM ProgrammeFee
//             WHERE ProgrammeID = ?
//             ORDER BY FeeType
//         `;
//         const [rows] = await pool.query(sqlQuery, [programmeId]);
//         return rows;
//     }
// }




// mssql
// const sql = require("mssql");
// const dbConfig = require("../dbConfig");

// class Programme {
//     constructor(programmeID, programmeName, category, location, description, startDate, endDate, fee, maxSlots, programmeLevel) {
//         this.programmeID = programmeID;
//         this.programmeName = programmeName;
//         this.category = category;
//         this.location = location;
//         this.description = description;
//         this.startDate = startDate;
//         this.endDate = endDate;
//         this.fee = fee;
//         this.maxSlots = maxSlots;
//         this.programmeLevel = programmeLevel;
//     }

//     // Get all programmes
//     static async getAllProgrammes() {
//         const connection = await sql.connect(dbConfig);
//         const sqlQuery = `SELECT * FROM Programme`;

//         const request = connection.request();
//         const result = await request.query(sqlQuery);

//         connection.close();

//         return result.recordset.map(row => new Programme(
//             row.ProgrammeID, row.ProgrammeName, row.Category, row.Location,
//             row.Description, row.StartDate, row.EndDate, row.Fee,
//             row.MaxSlots, row.ProgrammeLevel
//         ));
//     }

//     // Get programme by ID
//     static async getProgrammeByID(programmeID) {
//         const connection = await sql.connect(dbConfig);
//         const sqlQuery = `SELECT * FROM Programme WHERE ProgrammeID = @programmeID`;

//         const request = connection.request();
//         request.input("programmeID", sql.Int, programmeID);
//         const result = await request.query(sqlQuery);

//         connection.close();

//         if (result.recordset.length === 0) return null;
        
//         const row = result.recordset[0];
//         return new Programme(
//             row.ProgrammeID, row.ProgrammeName, row.Category, row.Location,
//             row.Description, row.StartDate, row.EndDate, row.Fee,
//             row.MaxSlots, row.ProgrammeLevel
//         );
//     }

//     // Get featured programmes
//     static async getFeaturedProgrammes() {
//         const connection = await sql.connect(dbConfig);
//         const sqlQuery = `
//             SELECT * FROM Programme
//             WHERE StartDate > GETDATE()
//             ORDER BY StartDate ASC
//             OFFSET 0 ROWS FETCH NEXT 5 ROWS ONLY;
//         `;

//         const request = connection.request();
//         const result = await request.query(sqlQuery);

//         connection.close();

//         return result.recordset.map(row => new Programme(
//             row.ProgrammeID, row.ProgrammeName, row.Category, row.Location,
//             row.Description, row.StartDate, row.EndDate, row.Fee,
//             row.MaxSlots, row.ProgrammeLevel
//         ));
//     }

    
//     // Get programmes by category with optional exclusion and limit
//     static async getProgrammesByCategory(category, excludeProgrammeID = null, limit = null) {
//         const connection = await sql.connect(dbConfig);
//         let sqlQuery = `
//             SELECT * FROM Programme 
//             WHERE Category = @category
//         `;

//         if (excludeProgrammeID) {
//             sqlQuery += ` AND ProgrammeID != @programmeID`;
//         }

//         sqlQuery += ` ORDER BY StartDate DESC`;

//         if (limit) {
//             sqlQuery += ` OFFSET 0 ROWS FETCH NEXT @limit ROWS ONLY`;
//         }

//         const request = connection.request();
//         request.input("category", sql.VarChar, category);

//         if (excludeProgrammeID) {
//             request.input("programmeID", sql.Int, excludeProgrammeID);
//         }

//         if (limit) {
//             request.input("limit", sql.Int, limit);
//         }

//         const result = await request.query(sqlQuery);
//         connection.close();

//         return result.recordset.map(row => new Programme(
//             row.ProgrammeID, row.ProgrammeName, row.Category, row.Location,
//             row.Description, row.StartDate, row.EndDate, row.Fee,
//             row.MaxSlots, row.ProgrammeLevel
//         ));
//     }


//     // Search programmes
//     static async searchProgrammes(keyword) {
//         const connection = await sql.connect(dbConfig);
//         const sqlQuery = `
//             SELECT * FROM Programme
//             WHERE ProgrammeName LIKE @keyword 
//             OR Description LIKE @keyword 
//         `;

//         const request = connection.request();
//         request.input("keyword", sql.VarChar, `%${keyword}%`);
//         const result = await request.query(sqlQuery);

//         connection.close();

//         return result.recordset.map(row => new Programme(
//             row.ProgrammeID, row.ProgrammeName, row.Category, row.Location,
//             row.Description, row.StartDate, row.EndDate, row.Fee,
//             row.MaxSlots, row.ProgrammeLevel
//         ));
//     }

//     //user programme info
    
//     //chatgpt
//     // Method to get schedules for a specific programme
//     static async getUpcomingSchedules(programmeId) {
//         const connection = await sql.connect(dbConfig);
//         const sqlQuery = `
//             SELECT ScheduleID, Level, StartDate, EndDate, StartTime, EndTime, MaxSlots
//             FROM ProgrammeSchedule
//             WHERE ProgrammeID = @programmeId AND StartDate >= GETDATE()
//             ORDER BY StartDate
//         `;
//         const request = connection.request();
//         request.input('programmeId', sql.Int, programmeId); // Pass programmeId as a parameter
//         const result = await request.query(sqlQuery);
//         connection.close();
//         return result.recordset;
//     }

//     // Method to get fees for a specific programme
//     static async getProgrammeFees(programmeId) {
//         const connection = await sql.connect(dbConfig);
//         const sqlQuery = `
//             SELECT FeeID, FeeType, Price, OriginalPrice, Benefits
//             FROM ProgrammeFee
//             WHERE ProgrammeID = @programmeId
//             ORDER BY FeeType
//         `;
//         const request = connection.request();
//         request.input('programmeId', sql.Int, programmeId); // Pass programmeId as a parameter
//         const result = await request.query(sqlQuery);
//         connection.close();
//         return result.recordset;
//     }   

    
//     // Get programmes by category
//     // static async getProgrammesByCategory(category) {
//     //     const connection = await sql.connect(dbConfig);
//     //     const sqlQuery = `
//     //         SELECT * FROM Programme 
//     //         WHERE Category = @category
//     //         ORDER BY StartDate DESC
//     //     `;

//     //     const request = connection.request();
//     //     request.input("category", sql.VarChar, category);
//     //     const result = await request.query(sqlQuery);

//     //     connection.close();

//     //     return result.recordset.map(row => new Programme(
//     //         row.ProgrammeID, row.ProgrammeName, row.Category, row.Location,
//     //         row.Description, row.StartDate, row.EndDate, row.Fee,
//     //         row.MaxSlots, row.ProgrammeLevel
//     //     ));
//     // }

//     // Get Related Programmes by Category
//     // static async getRelatedProgrammesByCategory(category) {
//     //     const connection = await sql.connect(dbConfig);
//     //     const sqlQuery = `
//     //         SELECT * FROM Programme 
//     //         WHERE Category = @category
//     //         AND ProgrammeID != @programmeID
//     //         ORDER BY StartDate DESC
//     //     `;

//     //     const request = connection.request();
//     //     request.input("category", sql.VarChar, category);
//     //     const result = await request.query(sqlQuery);

//     //     connection.close();

//     //     return result.recordset.map(row => new Programme(
//     //         row.ProgrammeID, row.ProgrammeName, row.Category, row.Location,
//     //         row.Description, row.StartDate, row.EndDate, row.Fee,
//     //         row.MaxSlots, row.ProgrammeLevel
//     //     ));
//     // }
    


// }

// module.exports = Programme;
