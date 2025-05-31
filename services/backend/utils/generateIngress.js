const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

async function generateIngress(roomUuid) {
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
            number: 80,
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

async function deleteIngressRule(roomUuid) {
  const ingressPath = "/mnt/ingress/ingress.yaml";

  const fileContent = fs.readFileSync(ingressPath, "utf8");
  const ingress = yaml.load(fileContent);

  const dataRule = ingress.spec.rules.find(
    (r) => r.host === "data.or-ecosystem.eu"
  );

  if (!dataRule) {
    throw new Error("Manjka host rule za data.or-ecosystem.eu");
  }

  const targetPath = `/ws/medical-device/${roomUuid}`;

  const index = dataRule.http.paths.findIndex((p) => p.path === targetPath);

  if (index !== -1) {
    dataRule.http.paths.splice(index, 1);

    const newYaml = yaml.dump(ingress, { lineWidth: -1 });
    fs.writeFileSync(ingressPath, newYaml, "utf8");

    console.log(`✅ Odstranjen path za room ${roomUuid}`);
  } else {
    console.log(`ℹ️ Path za room ${roomUuid} ni bil najden`);
  }

  return ingressPath;
}

module.exports = {
  generateIngress,
  deleteIngressRule,
};
