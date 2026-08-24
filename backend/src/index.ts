import { PORT } from "./constants.js";
import connectDB from "./db/db.js";
import app from "./app.js";


connectDB()
.then(() => {
    const server = app.listen(PORT,() => {
        console.log(`SERVER LISTENING ON PORT: ${PORT}`);
    })

    server.on("error", (error) => {
        console.log("SOME ERROR OCCURED :(", error);
        process.exit(1);
    })
})
.catch((error) => {
    console.log("DATABASE CONNECTION FAILED !!!", error);
})
