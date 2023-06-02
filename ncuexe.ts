#!/usr/bin/env bun

import { readFile, writeFile } from "fs/promises";
import { join } from "path";
import { program } from "commander";
import chalk from "chalk";
import semverGt from "semver/functions/gt";
import "@total-typescript/ts-reset";
import packageJson from "./package.json" assert { type: "json" };

type PackageJson = {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
};

type Args = {
  upgrade: boolean;
  latest: boolean;
  showAll: boolean;
};

async function getPackageJson(): Promise<PackageJson> {
  const packageJsonPath = join(process.cwd(), "package.json");
  const packageJsonBuffer = await readFile(packageJsonPath);
  const packageJsonString = packageJsonBuffer.toString();
  return JSON.parse(packageJsonString) as PackageJson;
}

async function getLatestVersion(packageName: string): Promise<string> {
  const response = await fetch(
    `https://registry.npmjs.org/${packageName}/latest`
  );
  const data: { version: string } = await response.json();
  return data.version;
}

async function checkForUpdates(args: Args): Promise<void> {
  if (args.showAll && args.upgrade) {
    console.log(
      chalk.red(
        "You cannot use both --show-all and --upgrade at the same time."
      )
    );
    return;
  }

  const packageJson = await getPackageJson();
  const dependencies = packageJson.dependencies ?? {};
  const devDependencies = packageJson.devDependencies ?? {};

  const dependenciesToCheck = Object.keys(dependencies).filter((name) => {
    if (args.latest || args.showAll) {
      return true;
    }
    return dependencies[name] !== "latest";
  });

  const devDependenciesToCheck = Object.keys(devDependencies).filter((name) => {
    if (args.latest || args.showAll) {
      return true;
    }
    return devDependencies[name] !== "latest";
  });

  const updates = {
    dependencies: await Promise.all(
      dependenciesToCheck.map(async (name) => {
        const latestVersion = await getLatestVersion(name);
        let currentVersion = dependencies[name];
        if (!Number.isInteger(Number.parseInt(currentVersion[0], 10))) {
          currentVersion =
            currentVersion === "latest"
              ? latestVersion
              : currentVersion.slice(1);
        }
        if (
          semverGt(latestVersion, currentVersion) ||
          args.showAll ||
          (args.latest && currentVersion === latestVersion)
        ) {
          return {
            name,
            currentVersion,
            latestVersion,
          };
        }
      })
    ),
    devDependencies: await Promise.all(
      devDependenciesToCheck.map(async (name) => {
        const latestVersion = await getLatestVersion(name);
        let currentVersion = devDependencies[name];
        if (!Number.isInteger(Number.parseInt(currentVersion[0], 10))) {
          currentVersion =
            currentVersion === "latest"
              ? latestVersion
              : currentVersion.slice(1);
        }
        if (
          semverGt(latestVersion, currentVersion) ||
          args.showAll ||
          (args.latest && currentVersion === latestVersion)
        ) {
          return {
            name,
            currentVersion,
            latestVersion,
          };
        }
      })
    ),
  };

  const filteredUpdates = {
    dependencies: updates.dependencies.filter(Boolean),
    devDependencies: updates.devDependencies.filter(Boolean),
  };

  const filteredUpdatesToArr = [
    ...filteredUpdates.dependencies,
    ...filteredUpdates.devDependencies,
  ];

  if (filteredUpdatesToArr.length === 0) {
    console.log(chalk.green("All dependencies are up to date!"));
    return;
  }

  if (args.showAll) {
    console.log(chalk.yellow(`Fetched all the dependencies for the project`));
  } else {
    console.log(
      chalk.yellow(
        `The following dependencies ${args.upgrade ? "are" : "can be"} updated:`
      )
    );
  }

  filteredUpdatesToArr.forEach(({ name, currentVersion, latestVersion }) => {
    console.log(
      `${chalk.bold(name)}: ${currentVersion} -> ${chalk.green(
        latestVersion === currentVersion ? "latest" : latestVersion
      )}`
    );
  });

  if (args.upgrade) {
    const updatedPackageJson = {
      ...packageJson,
      dependencies: {
        ...packageJson.dependencies,
        ...filteredUpdates.dependencies.reduce(
          (acc, { name, latestVersion }) => {
            acc[name] = `^${latestVersion}`;
            return acc;
          },
          {} as Record<string, string>
        ),
      },
      devDependencies: {
        ...packageJson.devDependencies,
        ...filteredUpdates.devDependencies.reduce(
          (acc, { name, latestVersion }) => {
            acc[name] = `^${latestVersion}`;
            return acc;
          },
          {} as Record<string, string>
        ),
      },
    };
    await writeFile(
      join(process.cwd(), "package.json"),
      JSON.stringify(updatedPackageJson, null, 2)
    );
    console.log(chalk.green("Dependencies upgraded successfully!"));
  }
}

program
  .option("-u, --upgrade", "Upgrade outdated dependencies")
  .option(
    "-l, --latest",
    `Upgrade dependencies marked "latest" to version number`
  )
  .option("--show-all", "Show all dependencies")
  .name("ncu")
  .version(packageJson.version)
  .on("--help", () => {
    console.log("");
    console.log("Examples:");
    console.log("  $ ncu -u");
    console.log("  $ ncu --upgrade");
  })
  .action(checkForUpdates)
  .parse(process.argv);
