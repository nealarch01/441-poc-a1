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

    console.log("Table created..");
}




async function populateTable(): Promise<void> {
    const queryText = `INSERT INTO products (name, price, description) VALUES ($1, $2, $3)`; // The dollar sign is a placeholder for a value
    // Do not await to run the query in parallel
    const items = [
        ["Bracelet", 10.99, "A bracelet made of gold"],
        ["Necklace", 15.99, "A necklace made of silver"],
        ["Ring", 5.99, "A ring made of platinum"],
        ["Earrings", 20.99, "Earrings made of gold"],
        ["Watch", 30.99, "A watch made of silver"],
        ["Belt", 25.99, "A belt made of leather"]
    ]

    for (const item of items) {
        await connection.pool.query(queryText, item);
        console.log("Inserted item: ", item);
    }

    console.log("Table populated..");
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
        await createTable();
        await populateTable();
    }

    // If table exists and the table is not empty, ask the user if they want to overwrite table
    if (!isTableEmpty) {
        const input = await getInput("Do you want to overwrite table contents? (y/n): ");
        if (input === "y") {
            await connection.pool.query("DELETE FROM products");
            await populateTable();
        }
    } else {
        console.log("Table is empty");
        await populateTable();
    }
}


main()
    .then(() => {
        console.log("Done");
        exit(0);
    });




console.log("Program finished..");