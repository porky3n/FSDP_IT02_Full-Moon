const dbConfig = require('../dbConfig'); // Ensure this uses the pooled connection

    class Programme {
        constructor(programmeID, programmeName, category, location, description, startDate, endDate, fee, maxSlots, programmeLevel) {
            this.programmeID = programmeID;
            this.programmeName = programmeName;
            this.category = category;
            this.location = location;
            this.description = description;
            this.startDate = startDate;
            this.endDate = endDate;
            this.fee = fee;
            this.maxSlots = maxSlots;
            this.programmeLevel = programmeLevel;
        }

        // Get all programmes
        static async getAllProgrammes() {
            const sqlQuery = `SELECT * FROM Programme`;
            
            try {
                const [rows] = await dbConfig.query(sqlQuery); // Executes query using the pooled connection

                return rows.map(
                    (row) => new Programme(
                        row.ProgrammeID,
                        row.ProgrammeName,
                        row.Category,
                        row.Location,
                        row.Description,
                        row.StartDate,
                        row.EndDate,
                        row.Fee,
                        row.MaxSlots,
                        row.ProgrammeLevel
                    )
                );
            } catch (error) {
                console.error("Database query error:", error);
                throw error;
            }
        }

        static async getProgrammeByID(programmeID) {
            const sqlQuery = `SELECT * FROM Programme WHERE ProgrammeID = ?`;

            try {
                const [rows] = await dbConfig.query(sqlQuery, [programmeID]);
                if (rows.length === 0) {
                    return null;
                }

                const row = rows[0];
                return new Programme(row.ProgrammeID, row.ProgrammeName,
                row.Category, row.Location, row.Description, row.StartDate,
                row.EndDate,row.Fee,row.MaxSlots,row.ProgrammeLevel
                );
            } catch (error) {
                console.error("Database query error:", error);
                throw error;
            }
        }

    // Get featured programmes based on criteria (e.g., soonest start date)
    static async getFeaturedProgrammes() {
        // Selecting upcoming programs with the soonest start dates
        const sqlQuery = `
            SELECT * FROM Programme
            WHERE StartDate > NOW()
            ORDER BY StartDate ASC
            LIMIT 5;
        `;

        try {
            const [rows] = await dbConfig.query(sqlQuery);
            return rows.map(row => new Programme(
                row.ProgrammeID, row.ProgrammeName, row.Category, row.Location,
                row.Description, row.StartDate, row.EndDate, row.Fee,
                row.MaxSlots, row.ProgrammeLevel
            ));
        } catch (error) {
            console.error("Database query error:", error);
            throw error;
        }
    }

    // Get programmes by category for popular category section
    static async getProgrammesByCategory(category) {
        const sqlQuery = `SELECT * FROM Programme WHERE Category = ?`;
        
        try {
            const [rows] = await dbConfig.query(sqlQuery, [category]);
            return rows.map(row => new Programme(
                row.ProgrammeID, row.ProgrammeName, row.Category, row.Location,
                row.Description, row.StartDate, row.EndDate, row.Fee,
                row.MaxSlots, row.ProgrammeLevel
            ));
        } catch (error) {
            console.error("Database query error:", error);
            throw error;
        }
    }

    // Search programmes based on keyword
    static async searchProgrammes(keyword) {
        const sqlQuery = `
            SELECT * FROM Programme
            WHERE ProgrammeName LIKE ? OR Description LIKE ? OR Category LIKE ?
        `;
        
        try {
            const [rows] = await dbConfig.query(sqlQuery, [`%${keyword}%`, `%${keyword}%`, `%${keyword}%`]);
            return rows.map(row => new Programme(
                row.ProgrammeID, row.ProgrammeName, row.Category, row.Location,
                row.Description, row.StartDate, row.EndDate, row.Fee,
                row.MaxSlots, row.ProgrammeLevel
            ));
        } catch (error) {
            console.error("Database query error:", error);
            throw error;
        }
    }

    // Get a single programme by ID
    static async getProgrammeByID(programmeID) {
        const sqlQuery = `SELECT * FROM Programme WHERE ProgrammeID = ?`;

        try {
            const [rows] = await dbConfig.query(sqlQuery, [programmeID]);
            if (rows.length === 0) {
                return null;
            }

            const row = rows[0];
            return new Programme(
                row.ProgrammeID, row.ProgrammeName, row.Category, row.Location,
                row.Description, row.StartDate, row.EndDate, row.Fee,
                row.MaxSlots, row.ProgrammeLevel
            );
        } catch (error) {
            console.error("Database query error:", error);
            throw error;
        }
    }


    // Create a new programme
    // static async createProgramme(programmeData) {
    //     const connection = await sql.connect(dbConfig);
    //     const sqlQuery = `INSERT INTO Programme (ProgrammeName, Category, Location, Description, StartDate, EndDate, Fee, MaxSlots, ProgrammeLevel)
    //                       VALUES (@programmeName, @category, @location, @description, @startDate, @endDate, @fee, @maxSlots, @programmeLevel);
    //                       SELECT SCOPE_IDENTITY() AS ProgrammeID;`;

    //     const request = connection.request();
    //     request.input('programmeName', sql.VarChar, programmeData.programmeName);
    //     request.input('category', sql.VarChar, programmeData.category);
    //     request.input('location', sql.VarChar, programmeData.location);
    //     request.input('description', sql.Text, programmeData.description);
    //     request.input('startDate', sql.Date, programmeData.startDate);
    //     request.input('endDate', sql.Date, programmeData.endDate);
    //     request.input('fee', sql.Decimal(10, 2), programmeData.fee);
    //     request.input('maxSlots', sql.Int, programmeData.maxSlots);
    //     request.input('programmeLevel', sql.VarChar, programmeData.programmeLevel);

    //     const result = await request.query(sqlQuery);
    //     connection.close();

    //     return result.recordset[0].ProgrammeID;
    // }
}

module.exports = Programme;
