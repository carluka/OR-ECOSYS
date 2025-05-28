const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

async function generateIngress(roomUuid, port) {
  const ingressPath = "/mnt/ingress/ingress.yaml";

  const fileContent = fs.readFileSync(ingressPath, "utf8");
  const ingress = yaml.load(fileContent);

  const dataRule = ingress.spec.rules.find(
    (r) => r.host === "data.or-ecosystem.eu"
  );

  if (!dataRule) {
    throw new Error("Manjka host rule za data.or-ecosystem.eu");
  }

  const newPath = `/ws/medical-device/${roomUuid}`;
  const alreadyExists = dataRule.http.paths.some((p) => p.path === newPath);

  if (!alreadyExists) {
    dataRule.http.paths.push({
      path: newPath,
      pathType: "Prefix",
      backend: {
        service: {
          name: `room-${roomUuid}-svc`,
          port: {
            number: port,
          },
        },
      },
    });

    const newYaml = yaml.dump(ingress, { lineWidth: -1 });
    fs.writeFileSync(ingressPath, newYaml, "utf8");

    console.log(`✅ Dodan path za room ${roomUuid}`);
  } else {
    console.log(`ℹ️ Path za room ${roomUuid} že obstaja`);
  }

  return ingressPath;
}

module.exports = {
  generateIngress,
};
