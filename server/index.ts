import connectDB from "./config/db.js";
import app from "./server.js";
import { env } from "./config/env.js";
import logger  from "./config/logger.js";
// Connect to the database
connectDB();
// Start the server
app.listen(env.PORT, () => {
    logger.logger.info(`Server is running on port ${env.PORT}`);
});

export default app;