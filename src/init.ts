// THIS IS NOT PART OF THE MAIN PROGRAM!!!!

// Program that helps creating a table named "products" and populating it with some data

import { exit } from "process";
import readline from "node:readline/promises";
import connection from "./connection";

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

async function tableExists(): Promise<boolean> {
    const queryText = `SELECT EXISTS ( SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'products' );`;
    const result = await connection.pool.query(queryText);
    if (result.rows[0]["exists"] === true) {
        return true;
    }
    return false;
}



async function tableEmpty(): Promise<boolean> {
    const queryText = `SELECT COUNT(*) FROM products;`;
    const result = await connection.pool.query(queryText);
    if (result.rows[0]["count"] === "0") {
        return true;
    }
    return false;
}




async function createTable(): Promise<void> {
    const query =
        `CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        description VARCHAR(100) NOT NULL
    )`;
    await connection.pool.query(query); // Block the main thread until the query is complete
}




async function populateTable(): Promise<void> {
    const queryText = `INSERT INTO products (name, price, description) VALUES ($1, $2, $3)`; // The dollar sign is a placeholder for a value
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

    // If table does not exist, create and populate it
    if (!doesTableExist) {
        createTable();
        populateTable();
    }

    // If table exists and the table is not empty, ask the user if they want to overwrite table
    if (!isTableEmpty) {
        console.log("Table is empty");
        const input = await getInput("Do you want to overwrite table contents? (y/n): ");
        if (input === "y") {
            await populateTable();
        } else if (input === "n") {
            exit(0);
        }
    } else {
        await populateTable();
    }

    exit(0);
}


main();

