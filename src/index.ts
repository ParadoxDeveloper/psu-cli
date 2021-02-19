import * as chalk from "chalk";
import * as axios from "axios";
import { writeFile, readFile } from "fs/promises";
import { createInterface } from "readline";
import { existsSync } from "fs";

// ---------------------------------- \\

// -- funcs -- \\
async function obfuscate(script: string, key: string, settings: object) {
  let result;
  await axios
    .default("https://api.psu.dev/obfuscate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: JSON.stringify({
        key,
        script,
        options: settings,
      }),
    })
    .then((r) => {
      if (r.data.data) {
        result = r.data as object
      } else {
        result = false;
      }
    });
  return result;
}

(async () => {
  console.log(`${chalk.green("[ PSU CLI ]: ")} Initialization:`);

  const interfaceRLine = createInterface({
    input: process.stdin,
  });

  if (!existsSync("./data.bin")) {
    interfaceRLine.question(
      `${chalk.green(" [ PSI CLI ]: Input >")}`,
      (ans) => {
        writeFile("data.bin", ans, { encoding: "utf-8" });
      }
    );
  }

  interfaceRLine.question(
    `${chalk.green(
      " [ PSU CLI ]: Script: ( Can be directory [Must be a .lua file] ) "
    )}`,
    async (ans) => {
      let key = readFile("./data.bin", { encoding: "utf-8" });
      if (ans.endsWith(".lua")) {
        let data = await obfuscate(
          await readFile(ans).then((r) => r.toString("utf-8")),
          await key.then((r) => r.toString()),
          { MaxSecurityEnabled: true }
        );
        if (data?.error > 2) {
          console.log(
            `${chalk.green(
              "[ PSU CLI ]: Error:"
            )} There's an error in your script!`
          );
        }
        writeFile("Output.lua", data?.data);
        setInterval(function() {}, 10000000);
      } else {
        // must be a script :sob:
        let data = await obfuscate(ans, await key.then((r) => r.toString()), {
          MaxSecurityEnabled: true,
        });
        if (data?.error > 1) {
          console.log(
            `${chalk.green(
              " [ PSU CLI ]: Error:"
            )} There's an error in your script`
          );
        }
        writeFile("Output.lua", data?.data, { encoding: "utf-8" });
        setInterval(function() {}, 10000000);
      }
    }
  );
})();
