const port = process.env.PORT;

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
);

app.use(morgan("dev"));

app.use(cookieParser());

app.use("/api/auth", proxy(process.env.AUTH_SERVICE));

app.use("/api/chat", protect, proxyWithHeader(process.env.CHAT_SERVICE));

app.use("/api/agent", protect, proxy(process.env.AGENT_SERVICE));

app.use("/api/billing", protect, proxyWithHeader(process.env.BILLING_SERVICE));

app.use("/api/me", protect, getCurrentUser);

app.get("/", (req, res) => {
  res.json({
    message: "hello from gateway",
  });
});

app.listen(port, () => {
  console.log(`gateway started at ${port}`);
});
