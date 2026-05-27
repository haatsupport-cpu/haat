// Patch server.js to enqueue orders instead of direct DB write, and wire up socket.io
// (Minimal diff, infrastructure only)
import { pushOrder } from "./queue/orderQueue.js";
import { v4 as uuidv4 } from "uuid";
import * as http from "http";
import { initSocket } from "./realtime/socket.js";

// ...existing code...

// Replace app.listen with HTTP server for socket.io
const server = http.createServer(app);
initSocket(server);

// ...existing code...

// Patch checkout route to enqueue order
import checkoutRoutes from "./routes/checkoutRoutes.js";

app.use("/api/checkout", checkoutLimiter, (req, res, next) => {
  if (req.method === "POST" && req.path === "/create-order") {
    // Intercept order creation for queueing
    const idempotencyKey = req.headers["idempotency-key"] || uuidv4();
    const order = { ...req.body, userId: req.user?.id };
    pushOrder(order, idempotencyKey)
      .then(({ orderId }) => {
        res.status(202).json({
          message: "Order received and queued",
          orderId,
          idempotencyKey,
        });
      })
      .catch((err) => {
        res.status(500).json({ message: "Failed to queue order", details: err.message });
      });
  } else {
    next();
  }
});

// ...existing code...

// Start server
server.listen(CONFIG.PORT, CONFIG.HOST, () => {
  console.log(`\nHaatOnline Backend Server\n...`);
});
