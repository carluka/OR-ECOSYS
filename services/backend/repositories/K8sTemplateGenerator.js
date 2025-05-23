const fs = require("fs");
const path = require("path");
const Handlebars = require("handlebars");

class K8sTemplateGenerator {
  constructor(templateDir, outputDir) {
    this.templateDir = templateDir;
    this.outputDir = outputDir;
  }

  async generateDeployment(roomUuid, consumerDeviceUuids, providers) {
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
      device_uuids: JSON.stringify(consumerDeviceUuids),
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
}

module.exports = K8sTemplateGenerator;
