// Provides a connection pool for source files to use
import pg from "pg";

class Connection {
    public static pool: pg.Pool = new pg.Pool({
        host: "localhost",
        port: 2001,
        database: "sample"
    });
}

export default Connection;