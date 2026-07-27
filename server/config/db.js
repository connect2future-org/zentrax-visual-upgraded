const mongoose = require("mongoose");
const dns = require("dns");

const getMongoUri = () => {
  return process.env.MONGO_URI || process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/zentrax";
};

const ensureAtlasDnsResolver = async () => {
  const mongoUri = getMongoUri();
  if (!mongoUri.startsWith("mongodb+srv://")) return;

  const clusterHost = mongoUri.split("@")[1]?.split("/")[0];
  if (!clusterHost) return;

  const srvName = `_mongodb._tcp.${clusterHost}`;
  try {
    await dns.promises.resolveSrv(srvName);
  } catch (err) {
    const servers = dns.getServers();
    if (servers.length === 0 || (servers.length === 1 && servers[0] === "127.0.0.1")) {
      dns.setServers(["8.8.8.8", "1.1.1.1"]);
      console.log("⚙️ Node DNS resolver fallback enabled for Atlas SRV lookup:", dns.getServers());
    } else {
      dns.setServers(["8.8.8.8", "1.1.1.1"]);
      console.log("⚙️ Atlas SRV lookup failed, using fallback DNS for Atlas:", err.code || err.message);
    }
  }
};

const connectDB = async (retryCount = 0) => {
  const mongoUri = getMongoUri();
  await ensureAtlasDnsResolver();

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      autoIndex: true,
      family: 4,
    });

    console.log(`✅ MongoDB Connected → ${conn.connection.host}`);

    // Seed default users & demo data on first connect
    await seedDatabase();
    return conn;
  } catch (err) {
    const message = err?.message || String(err);
    console.error("❌ MongoDB connection error:", message);

    if (retryCount < 2) {
      console.log(`⏳ Retrying MongoDB connection in 5s (${retryCount + 1}/2)...`);
      setTimeout(() => connectDB(retryCount + 1), 5000);
      return null;
    }

    console.error("⚠️ Continuing without MongoDB. Database-backed routes will fail until MongoDB is reachable.");
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
