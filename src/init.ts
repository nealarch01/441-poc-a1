// THIS IS NOT PART OF THE MAIN PROGRAM!!!!

// Program that helps creating a table named "items" and populating it with some data

import { exit } from "process";
import readline from "node:readline/promises";
import connection from "./connection";

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

async function tableExists(): Promise<boolean> {
    const queryText = `SELECT EXISTS ( SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'items' );`;
    const result = await connection.pool.query(queryText);
    if (result.rows[0]["exists"] === true) {
        return true;
    }
    return false;
}



async function tableEmpty(): Promise<boolean> {
    const queryText = `SELECT COUNT(*) FROM items;`;
    const result = await connection.pool.query(queryText);
    if (result.rows[0]["count"] === "0") {
        return true;
    }
    return false;
}




async function createTable(): Promise<void> {
    const query =
        `CREATE TABLE IF NOT EXISTS items (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        description VARCHAR(100) NOT NULL
    )`;
    await connection.pool.query(query); // Block the main thread until the query is complete
}




async function populateTable(): Promise<void> {
    const queryText = `INSERT INTO items (name, price, description) VALUES ($1, $2, $3)`; // The dollar sign is a placeholder for a value
    // Do not await to run the query in parallel
    connection.pool.query(queryText, ["Emerald", 250.00, "A green gem"]);
    connection.pool.query(queryText, ["Ruby", 300.00, "A red gem"]);
    connection.pool.query(queryText, ["Sapphire", 200.00, "A blue gem"]);
    connection.pool.query(queryText, ["Amethyst", 150.00, "A purple gem"]);
    connection.pool.query(queryText, ["Diamond", 750.00, "A clear gem"]);
    connection.pool.query(queryText, ["Topaz", 100.00, "A yellow gem"]);
    connection.pool.query(queryText, ["Opal", 50.00, "A white gem"]);

    // Wait for all queries to complete by delaying
    // Check if the pool released all connections
    while (connection.pool.totalCount !== connection.pool.idleCount) {
        // Do nothing and wait for the pool to release all connections (all queries to complete)
    }
    console.log("Finished populating table...");
}


// async function to block the main thread until the user enters a value
async function getInput(prompt: string): Promise<string> {
    let input = await rl.question(prompt);
    if (input !== "y" && input !== "n") {
        console.log("Invalid input");
        input = await getInput(prompt); // Ask again
    }
    return input;
}


async function main(): Promise<void> {
    const doesTableExist = await tableExists();
    const isTableEmpty = await tableEmpty();

    if (doesTableExist && isTableEmpty) {
        console.log("Table already exists");
        const input = await getInput("Overwrite table? (y/n): ");
        if (input === "n") {
            exit(0);
        }
        // Drop the table 
        await connection.pool.query("DROP TABLE items"); // Drop the table
    } else if (doesTableExist && !isTableEmpty) {
        console.log("Table is not empty");
        const input = await getInput("Overwrite table? (y/n): ");
        if (input === "n") {
            exit(0);
        }
        await connection.pool.query("DELETE FROM items"); // Delete all rows from the table
        await populateTable();
        exit(0);
    }


    // If the table does not exist and is empty, create the table and populate it
    await createTable();
    await populateTable();

    exit(0);
}


main();

