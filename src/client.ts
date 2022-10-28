import axios from "axios"; // A library for HTTP requests that returns promises.
import graphql from "graphql";


async function queryAll(): Promise<any> {
    const query = `{
            items {
            id
            name
            price
            description
            }
    }`;
    const response = await axios.post("http://localhost:2002/graphql", { query });
    return response.data.data;
}




async function main() {

}


main();
