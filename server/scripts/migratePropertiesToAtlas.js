require("dotenv").config();
const mongoose = require("mongoose");
const dns = require("dns");
const Property = require("../models/Property");

const localUri = "mongodb://127.0.0.1:27017/zentrax";
const atlasUri = process.env.MONGO_URI;

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
    dns.setServers(["8.8.8.8", "1.1.1.1"]);
    console.log("⚙️ Atlas migration SRV fallback enabled:", dns.getServers());
    await dns.promises.resolveSrv(srvName);
  }
};

const run = async () => {
  console.log("Connecting to Local MongoDB...");
  const localConn = await mongoose.createConnection(localUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  console.log("Connecting to Atlas...");
  await ensureAtlasDnsResolver();
  const atlasConn = await mongoose.createConnection(atlasUri, {
    family: 4,
  });

  const LocalProperty = localConn.model("Property", Property.schema, "properties");
  const AtlasProperty = atlasConn.model("Property", Property.schema, "properties");

  const properties = await LocalProperty.find({}).lean();
  console.log(`Found ${properties.length} properties`);

  let inserted = 0;
  let updated = 0;
  let skipped = 0;

  for (let i = 0; i < properties.length; i++) {
    const property = properties[i];
    console.log(`Migrating ${i + 1}/${properties.length}`);
    const result = await AtlasProperty.findOneAndUpdate(
      { _id: property._id },
      property,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    if (result) {
      if (result.createdAt && result.updatedAt && result.createdAt.getTime() === result.updatedAt.getTime()) {
        inserted++;
      } else {
        updated++;
      }
    } else {
      skipped++;
    }
  }

  console.log("Summary");
  console.log(`Total Found: ${properties.length}`);
  console.log(`Inserted: ${inserted}`);
  console.log(`Updated: ${updated}`);
  console.log(`Skipped: ${skipped}`);
  console.log("Completed Successfully");

  await localConn.close();
  await atlasConn.close();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
