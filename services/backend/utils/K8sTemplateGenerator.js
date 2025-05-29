const fs = require("fs");
const path = require("path");
const Handlebars = require("handlebars");

class K8sTemplateGenerator {
  constructor(templateDir, outputDir) {
    this.templateDir = templateDir;
    this.outputDir = outputDir;

    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  async generateDeployment(roomUuid, consumerDeviceUuids, providers, roomID) {
    const consumerTemplatePath = path.join(
      this.templateDir,
      "consumer-deployment.yaml"
    );
    const consumerTemplateContent = fs.readFileSync(
      consumerTemplatePath,
      "utf8"
    );
    const consumerTemplate = Handlebars.compile(consumerTemplateContent);

    const consumerYaml = consumerTemplate({
      room_uuid: roomUuid,
      PORT: 8000 + Number(roomID),
      device_uuids: JSON.stringify(consumerDeviceUuids),
      websocket_add: `/ws/medical-device/${roomUuid}`,
    });

    const consumerOutputPath = path.join(
      this.outputDir,
      `${roomUuid}-consumer-deployment.yaml`
    );
    fs.writeFileSync(consumerOutputPath, consumerYaml, "utf8");

    for (const provider of providers) {
      const providerTemplatePath = path.join(
        this.templateDir,
        "provider-deployment.yaml"
      );
      const providerTemplateContent = fs.readFileSync(
        providerTemplatePath,
        "utf8"
      );
      const providerTemplate = Handlebars.compile(providerTemplateContent);

      const providerYaml = providerTemplate({
        room_uuid: roomUuid,
        provider_type: provider.type,
        provider_uuid: provider.uuid,
        replicas: 0,
      });

      const providerOutputPath = path.join(
        this.outputDir,
        `${roomUuid}-provider-${provider.type}-deployment.yaml`
      );
      fs.writeFileSync(providerOutputPath, providerYaml, "utf8");
    }

    return {
      consumerYamlPath: consumerOutputPath,
      providerYamlPaths: providers.map((p) =>
        path.join(
          this.outputDir,
          `${roomUuid}-provider-${p.type}-deployment.yaml`
        )
      ),
    };
  }

  async generateService(roomUuid, roomID) {
    const consumerTemplatePath = path.join(
      this.templateDir,
      "consumer-service.yaml"
    );
    const consumerTemplateContent = fs.readFileSync(
      consumerTemplatePath,
      "utf8"
    );
    const consumerTemplate = Handlebars.compile(consumerTemplateContent);

    const consumerYaml = consumerTemplate({
      room_uuid: roomUuid,
      PORT: 8000 + Number(roomID),
    });

    const consumerOutputPath = path.join(
      this.outputDir,
      `${roomUuid}-consumer-service.yaml`
    );
    fs.writeFileSync(consumerOutputPath, consumerYaml, "utf8");
    return {
      consumerYamlPathService: consumerOutputPath,
    };
  }
}

module.exports = K8sTemplateGenerator;
