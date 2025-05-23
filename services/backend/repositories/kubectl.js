const { exec } = require("child_process");

function kubectlApply(filePath, namespace = "or-ecosys") {
  return new Promise((resolve, reject) => {
    exec(
      `kubectl apply -f ${filePath} -n ${namespace}`,
      (err, stdout, stderr) => {
        if (err) {
          console.error(`❌ kubectl apply failed for ${filePath}:`, stderr);
          return reject(err);
        }
        console.log(`✅ kubectl apply succeeded for ${filePath}:\n`, stdout);
        resolve(stdout);
      }
    );
  });
}

function kubectlScale(deploymentName, replicas, namespace = "or-ecosys") {
  return new Promise((resolve, reject) => {
    exec(
      `kubectl scale deployment/${deploymentName} -n ${namespace} --replicas=${replicas}`,
      (err, stdout, stderr) => {
        if (err) return reject(stderr);
        resolve(stdout);
      }
    );
  });
}

module.exports = { kubectlApply, kubectlScale };
