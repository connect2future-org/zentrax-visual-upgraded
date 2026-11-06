const mongoose = require("mongoose");
const dns = require("dns");

const trustedDnsResolvers = ["1.1.1.1", "8.8.8.8"];

const getMongoUri = () => {
  return process.env.MONGO_URI || process.env.MONGODB_URI || "";
};

const ensureAtlasDnsResolver = async (mongoUri) => {
  if (!mongoUri.startsWith("mongodb+srv://")) return;

  const clusterHost = new URL(mongoUri).hostname;
  if (!clusterHost) return;

  const srvName = `_mongodb._tcp.${clusterHost}`;
  try {
    await dns.promises.resolveSrv(srvName);
    return;
  } catch (err) {
    console.warn(`MongoDB SRV lookup through the default Node.js resolver failed (${err.code || "DNS error"}); checking alternate resolvers.`);
  }

  let lastError;
  for (const server of trustedDnsResolvers) {
    const resolver = new dns.promises.Resolver();
    resolver.setServers([server]);
    try {
      const srvRecords = await resolver.resolveSrv(srvName);
      await resolver.resolveTxt(clusterHost);
      if (!srvRecords.length) throw new Error("MongoDB SRV lookup returned no records");

      // The MongoDB driver uses Node's process-wide resolver for SRV URIs.
      // Set it only after this resolver has returned valid SRV and TXT answers.
      dns.setServers([server]);
      console.warn("Using a verified alternate DNS resolver for MongoDB SRV lookups in this Node.js process.");
      return;
    } catch (err) {
      lastError = err;
    }
  }

  throw new Error(`MongoDB SRV DNS failed with the default and alternate resolvers (${lastError?.code || "DNS error"}).`);
};

const connectDB = async (retryCount = 0) => {
  const mongoUri = getMongoUri();
  if (!mongoUri) {
    console.error("MongoDB connection unavailable: set MONGO_URI or MONGODB_URI in server/.env.");
    return null;
  }
  try {
    await ensureAtlasDnsResolver(mongoUri);
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      autoIndex: true,
      autoCreate: false,
      family: 4,
    });

    console.log("MongoDB connection established.");

    // Seed default users & demo data on first connect
    await seedDatabase();
    return conn;
  } catch (err) {
    console.error("MongoDB connection failed:", err?.name || "ConnectionError", err?.code || err?.cause?.code || "no error code");

    if (retryCount < 2) {
      console.log(`⏳ Retrying MongoDB connection in 5s (${retryCount + 1}/2)...`);
      setTimeout(() => connectDB(retryCount + 1), 5000);
      return null;
    }

    console.error("MongoDB remains unavailable. Check SRV DNS, network access, and the configured MongoDB service.");
    return null;
  }
};

async function seedDatabase() {
  if (mongoose.connection.readyState !== 1) return;

  const User = require("../models/User");
  const Project = require("../models/Project");
  const Milestone = require("../models/Milestone");

  console.log("🌱 Seeding default users and demo data (upsert mode)...");

  async function upsertUser(name, email, password, role) {
    let u = await User.findOne({ email });
    if (u) {
      u.name = name;
      u.password = password; // plain text -> pre-save hook will hash
      u.role = role;
      await u.save();
      console.log(`🔁 Updated user: ${email}`);
      return u;
    }
    u = await User.create({ name, email, password, role });
    console.log(`✨ Created user: ${email}`);
    return u;
  }

  const manager = await upsertUser("Ravi Kumar", "manager@zentrax.com", "manager123", "manager");
  const client = await upsertUser("Priya Sharma", "client@zentrax.com", "client123", "client");

  // Create a demo project if it doesn't exist
  let project = await Project.findOne({ title: "Whitefield Villa" });
  if (!project) {
    project = await Project.create({
      title: "Whitefield Villa",
      description: "4BHK luxury villa construction",
      location: "Whitefield, Bengaluru",
      clientId: client._id,
      managerId: manager._id,
      status: "ongoing",
      completion: 65,
      startDate: new Date("2025-01-15"),
    });

    await Milestone.insertMany([
      { projectId: project._id, title: "Foundation Completed", completed: true, date: new Date("2025-02-10") },
      { projectId: project._id, title: "Plinth Beam Done", completed: true, date: new Date("2025-03-05") },
      { projectId: project._id, title: "Ground Floor Slab", completed: false, date: new Date("2025-06-01") },
    ]);
    console.log("✅ Demo project and milestones created");
  } else {
    console.log("ℹ️ Demo project already exists; skipping project creation");
  }

  console.log("✅ Seed complete. Demo credentials:");
  console.log("   manager@zentrax.com / manager123");
  console.log("   client@zentrax.com  / client123");
}

module.exports = connectDB;
module.exports.ensureAtlasDnsResolver = ensureAtlasDnsResolver;
