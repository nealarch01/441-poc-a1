import { exit } from "process";
import { createPostGraphileSchema, withPostGraphileContext } from "postgraphile";
import { Pool } from "pg";

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
    const result = await withPostGraphileContext({ pgPool }, async context => {
        return await graphql(schema, queryText, null, context);
    });
    // console.log(result.data!);
    console.log(result.data!["allProducts"]["edges"]);
}

main()
    .then(() => {
        console.log("Done..");
        exit(0);
    });
