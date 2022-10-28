import { exit } from "process"; // Ends the node process
import { createPostGraphileSchema, withPostGraphileContext } from "postgraphile"; 
// createPostGraphileSchema is a PostGraphile schema 
// withPostGraphileContext is a direction connection to the database
import { Pool } from "pg"; // Pool is a connection pool
import { graphql } from "graphql"; // graphql is a function that takes a schema, a query, and a context and returns a promise
import type { GraphQLSchema } from "graphql"; // GraphQLSchema type 


// What the query output will look like:
type Query = {
    allProducts: {
        edges: {
            node: {
                id: number;
                name: string;
                price: number;
                description: string;
            }
        }[]
    }
}

// Pool of connections 
const pgPool = new Pool({
    host: "localhost",
    database: "sample",
    port: 2001
});

// Creates and returns a GraphQL schema
async function createSchema(): Promise<GraphQLSchema> {
    return await createPostGraphileSchema(pgPool, ["public"]); // public is the schema name and is the default value
}

// Utility function that makes a direct connection
async function pgExample() {
    const queryText = `SELECT * FROM products`;
    let result = await pgPool.query(queryText);
    console.log(result.rows);
}

async function main() {
    const schema = await createSchema();
    const queryText = `{ 
        allProducts { 
            edges { 
                node { 
                    id, 
                    name, 
                    price, 
                    description 
                } 
            } 
        } 
    }`;
    const result = await withPostGraphileContext({ pgPool }, async context => {
        return await graphql(schema, queryText, null, context);
    });
    console.log(result.data!["allProducts"]["edges"]);
}

main()
    .then(() => {
        console.log("Done..");
        exit(0);
    });
