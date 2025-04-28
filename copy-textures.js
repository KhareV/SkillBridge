const fs = require("fs");
const path = require("path");
const sourceDir = path.join(__dirname, "node_modules/three-globe/example/img");
const targetDir = path.join(__dirname, "public/textures");
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}
const files = [
  { source: "earth-blue-marble.jpg", target: "earth-blue-marble.jpg" },
  { source: "earth-blue-marble.jpg", target: "earth-daylight.jpg" },
  { source: "earth-night.jpg", target: "earth-night.jpg" },
  { source: "earth-topology.png", target: "earth-topology.png" },
  { source: "earth-water.png", target: "earth-water.png" },
];
files.forEach((file) => {
  try {
    const sourceFile = path.join(sourceDir, file.source);
    const targetFile = path.join(targetDir, file.target);

    if (fs.existsSync(sourceFile)) {
      fs.copyFileSync(sourceFile, targetFile);
      console.log(`✓ Copied ${file.source} to ${targetFile}`);
    } else {
      console.error(`× File not found: ${sourceFile}`);
    }
  } catch (error) {
    console.error(`Error copying ${file.source}: ${error.message}`);
  }
});
const additionalFiles = [
  {
    name: "earth-clouds.png",
    url: "https://raw.githubusercontent.com/turban/webgl-earth/master/images/cloud.png",
  },
];

console.log("\nAdditional textures required:");
additionalFiles.forEach((file) => {
  console.log(
    `- ${file.name}: Download from ${file.url} and place in ${targetDir}`
  );
});

console.log("\nTexture copying complete!");
console.log(
  "Note: For the cloud texture, you may need to download it manually from the provided URL."
);
console.log("Current user:", "vkhare2909");
console.log("Date:", "2025-03-04 06:34:21");
