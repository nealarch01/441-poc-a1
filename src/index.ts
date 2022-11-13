import { exit } from "process"; // Ends the node process
import { createPostGraphileSchema, withPostGraphileContext } from "postgraphile";
// createPostGraphileSchema is a PostGraphile schema 
// withPostGraphileContext is a direction connection to the database
import { Pool } from "pg"; // Pool is a connection pool
import { graphql } from "graphql"; // graphql is a function that takes a schema, a query, and a context and returns a promise
import type { GraphQLSchema } from "graphql"; // GraphQLSchema type 

class Product {
    sku: string;
    title: string;
    brand: string;
    summary: string;
    price: number;
    quantity: number;
    category: string;
    creator: number;
    creation_date: string; // Date format: 2022-01-01
    supplier: string;

    // Constructor that contains default parameters
    constructor(sku: string = "na", title: string = "na", brand: string = "na", summary: string = "na", price: number = 0, quantity: number = 0,
                category: string = "na", creator: number = 0, creation_date: string = "na", supplier: string = "na") {
        this.sku = sku;
        this.title = title;
        this.brand = brand;
        this.summary = summary;
        this.price = price;
        this.quantity = quantity;
        this.category = category;
        this.creator = creator;
        this.creation_date = creation_date;
        this.supplier = supplier;
    }
}

/*
create table product (
    sku VARCHAR(50) NOT NULL PRIMARY KEY,
    title VARCHAR(50) NOT NULL,
    brand VARCHAR(50) NOT NULL,
    summary TEXT NOT NULL,
    price FLOAT NOT NULL,
    quantity INT NOT NULL,
    category VARCHAR(50) NOT NULL,
    creator INT NOT NULL,
    creation_date DATE NOT NULL,
    supplier VARCHAR(50)
);
*/

type QueryReply = {
    data: any
    err: null | string
}


type ProductReply = {
    products: Product[] | null;
    err: string | null;
}


// Pool of connections 
const pgPool = new Pool({
    host: "localhost",
    database: "development",
    port: 2001
});

// Creates and returns a GraphQL schema
async function createSchema(): Promise<GraphQLSchema> {
    return await createPostGraphileSchema(pgPool, ["public"]); // public is the schema name and is the default value
}

async function executeGraphQuery(queryText: string): Promise<QueryReply> {
    const schema = await createSchema();
    const result = await withPostGraphileContext({ pgPool }, async context => {
        return await graphql(schema, queryText, null, context);
    });
    if (result.errors === undefined) {
        return { data: result.data, err: null };
    }
    return { data: null, err: result.errors[0].message };
}

// Utility function that makes a query to the PostgreSQL database
async function pgExample() {
    const queryText = `SELECT * FROM products`;
    let result = await pgPool.query(queryText);
    console.log(result.rows);
}

async function getAllProducts(): Promise<ProductReply> {
    const queryText = `query { 
        allProducts { 
            edges { 
                node { 
                    sku
                    title
                    brand
                    summary
                    price
                    quantity
                    category
                    creator
                    creationDate
                    supplier
                } 
            } 
        } 
    }`;
    const result = await executeGraphQuery(queryText);
    if (result.err !== null) {
        return {
            products: null,
            err: result.err
        }
    }
    return {
        products: result.data.allProducts.edges as Product[] ?? null,
        err: null
    }
}


async function getProductBySku(sku: string): Promise<ProductReply> {
    const queryText = `query { 
        productBySku( sku: "${sku}" ) { 
            sku
            title
            brand
            summary
            price
            quantity
            category
            creator
            creationDate
            supplier
        } 
    }`;
    const result = await executeGraphQuery(queryText);
    if (result.err !== null) {
        console.log(result.err);
        return {
            products: null,
            err: result.err
        }
    }
    return {
        products: [result.data.productBySku] as Product[] ?? null,
        err: null
    }
}

async function updateQuantity(sku: string, newQuantity: number): Promise< { err: string | null }> {
    const query = `mutation {
        updateProductBySku(input: { sku: "${sku}", 
            productPatch: { 
                quantity: ${newQuantity}
            }
        }) {
            product {
                sku
                quantity
            }
        }
    }
    `
    const result = await executeGraphQuery(query);
    if (result.err !== null) {
        return {
            err: result.err
        }
    }
    // Return the copy of the product that was updated
    return {
        err: null
    }
}

async function deleteProduct(sku: string): Promise< { err: string | null }> {
    const query = `mutation {
        deleteProductBySku(input: {sku: "${sku}"}) {
            clientMutationId
        }
    }`;
    const result = await executeGraphQuery(query);
    if (result.err !== null) {
        console.log(result.err);
        return {
            err: result.err
        }
    }
    // Return the copy of the product that was deleted
    return {
        err: null
    }
}

async function createProduct(product: Product): Promise<ProductReply> {
    const createQuery = `mutation {
        createProduct(input: {
            product: {
                sku: "${product.sku}"
                title: "${product.title}"
                brand: "${product.brand}"
                summary: "${product.summary}"
                price: ${product.price}
                quantity: ${product.quantity}
                category: "${product.category}"
                creator: ${product.creator}
                creationDate: "${product.creation_date}"
                supplier: "${product.supplier}"
            }
        }){
            product {
                sku
                title
                brand
                summary
                price
                quantity
                category
                creator
                creationDate
                supplier
            }
        }
    }`
    const result = await executeGraphQuery(createQuery);
    if (result.err !== null) {
        console.log(result.err);
        return {
            products: null,
            err: result.err
        }
    }
    console.log(result.data);
    return {
        products: [product] as Product[] ?? null,
        err: null
    }
}


// async function main() {
//     let allProds = await getAllProducts();
//     console.log(allProds);
// }

// main()
//     .then(() => {
//         console.log("Program ended with no errors 😎");
//         exit(0);
//     });

export { getAllProducts, getProductBySku, updateQuantity, deleteProduct, createProduct, Product };
