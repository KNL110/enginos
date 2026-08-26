import { sql } from "drizzle-orm";
import { PORT } from "./constants.js";
import db from "./db/db.js";
import app from "./app.js";


db.execute(sql`select 1`).then(()=>{
    console.log("DATABASE CONNECTED!")
})
.then(() => {
    const server = app.listen(PORT,() => {
        console.log(`SERVER LISTENING ON PORT: ${PORT}`);
    })

    server.on("error", (error) => {
        console.log("SOME ERROR OCCURED :(", error);
        process.exit(1);
    })
})
.catch((error: unknown) => {
    console.log("DATABASE CONNECTION FAILED !!!", error);
    process.exit(1);
})
