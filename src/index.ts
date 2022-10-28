import { exit } from "process";
import { createPostGraphileSchema, withPostGraphileContext } from "postgraphile";
import { Pool } from "pg";

import graphql from "graphql";

const port = 2001;
const dbName = "sample";
const connectionString = `postgres://postgres:password@localhost:${port}/${dbName}`;

const pgPool = new Pool({
    connectionString
});

async function createSchema(): Promise<any> {
    return await createPostGraphileSchema(connectionString, "public", {});
}

// https://www.graphile.org/postgraphile/usage-schema/
// https://github.com/graphile/cookbook/blob/master/examples/schema_only/QueryRunner.js
// https://www.graphile.org/postgraphile/usage-schema/

async function main() {
    // createPostGraphileSchema("postgres://postgres:password@localhost:2001/sample", "public")
    const schema = await createSchema();
    return await withPostGraphileContext({
        pgPool
    }, async (context: any): Promise<any> => {
        const query = `{
            items {
                id,
                name,
                price,
                description
            }
        }`;
        return await graphql(schema, query, null, context);
    });
}


main();
