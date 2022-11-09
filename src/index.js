"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Product = exports.createProduct = exports.deleteProduct = exports.updateQuanatity = exports.getProductBySku = exports.getAllProducts = void 0;
const postgraphile_1 = require("postgraphile");
// createPostGraphileSchema is a PostGraphile schema 
// withPostGraphileContext is a direction connection to the database
const pg_1 = require("pg"); // Pool is a connection pool
const graphql_1 = require("graphql"); // graphql is a function that takes a schema, a query, and a context and returns a promise
class Product {
    // Constructor that contains default parameters
    constructor(sku = "na", title = "na", brand = "na", summary = "na", price = 0, quantity = 0, category = "na", creator = 0, creation_date = "na", supplier = "na") {
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
exports.Product = Product;
// Pool of connections 
const pgPool = new pg_1.Pool({
    host: "localhost",
    database: "development",
    port: 2001
});
// Creates and returns a GraphQL schema
function createSchema() {
    return __awaiter(this, void 0, void 0, function* () {
        return yield (0, postgraphile_1.createPostGraphileSchema)(pgPool, ["public"]); // public is the schema name and is the default value
    });
}
function executeGraphQuery(queryText) {
    return __awaiter(this, void 0, void 0, function* () {
        const schema = yield createSchema();
        const result = yield (0, postgraphile_1.withPostGraphileContext)({ pgPool }, (context) => __awaiter(this, void 0, void 0, function* () {
            return yield (0, graphql_1.graphql)(schema, queryText, null, context);
        }));
        if (result.errors === undefined) {
            return { data: result.data, err: null };
        }
        return { data: null, err: result.errors[0].message };
    });
}
// Utility function that makes a query to the PostgreSQL database
function pgExample() {
    return __awaiter(this, void 0, void 0, function* () {
        const queryText = `SELECT * FROM products`;
        let result = yield pgPool.query(queryText);
        console.log(result.rows);
    });
}
function getAllProducts() {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
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
        const result = yield executeGraphQuery(queryText);
        if (result.err !== null) {
            return {
                products: null,
                err: result.err
            };
        }
        return {
            products: (_a = result.data.allProducts.edges) !== null && _a !== void 0 ? _a : null,
            err: null
        };
    });
}
exports.getAllProducts = getAllProducts;
function getProductBySku(sku) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
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
        const result = yield executeGraphQuery(queryText);
        if (result.err !== null) {
            console.log(result.err);
            return {
                products: null,
                err: result.err
            };
        }
        return {
            products: (_a = [result.data.productBySku]) !== null && _a !== void 0 ? _a : null,
            err: null
        };
    });
}
exports.getProductBySku = getProductBySku;
function updateQuanatity(sku, newQuantity) {
    return __awaiter(this, void 0, void 0, function* () {
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
    `;
        const result = yield executeGraphQuery(query);
        if (result.err !== null) {
            return {
                err: result.err
            };
        }
        // Return the copy of the product that was updated
        return {
            err: null
        };
    });
}
exports.updateQuanatity = updateQuanatity;
function deleteProduct(sku) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = `mutation {
        deleteProductBySku(input: {sku: "${sku}"}) {
            clientMutationId
        }
    }`;
        const result = yield executeGraphQuery(query);
        if (result.err !== null) {
            console.log(result.err);
            return {
                err: result.err
            };
        }
        // Return the copy of the product that was deleted
        return {
            err: null
        };
    });
}
exports.deleteProduct = deleteProduct;
function createProduct(product) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
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
    }`;
        const result = yield executeGraphQuery(createQuery);
        if (result.err !== null) {
            console.log(result.err);
            return {
                products: null,
                err: result.err
            };
        }
        console.log(result.data);
        return {
            products: (_a = [product]) !== null && _a !== void 0 ? _a : null,
            err: null
        };
    });
}
exports.createProduct = createProduct;
