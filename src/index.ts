import { exit } from "process";
import { createPostGraphileSchema } from "postgraphile";
import { Pool } from "pg";

import { graphql } from "graphql";

const pgPool = new Pool({
    host: "localhost",
    database: "sample",
    port: 2001
});

async function createSchema(): Promise<any> {
    return await createPostGraphileSchema(pgPool, ["public"]);
}

// https://www.graphile.org/postgraphile/usage-schema/
// https://github.com/graphile/cookbook/blob/master/examples/schema_only/QueryRunner.js
// https://www.graphile.org/postgraphile/usage-schema/

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
    let result = await graphql(schema, queryText);
    console.log("data: ");
    console.log(result["data"]!["allProducts"]);
}

main()
    .then(() => {
        console.log("Done..");
        exit(0);
    })
