import chalk from "chalk";

function showHelp() {
  console.log(`
${chalk.bold.cyan("tnpm")} - ${chalk.gray("A simple npm alternative.")}

${chalk.bold("Usage:")}
    ${chalk.green("tnpm")} ${chalk.yellow("<command>")} [options]

${chalk.bold("Commands:")}
    ${chalk.yellow(
      "install"
    )}        Install dependencies from package.json or given packages (alias: ${chalk.yellow(
    "i"
  )}, ${chalk.yellow("add")}, ${chalk.yellow("get")})
    ${chalk.yellow("uninstall")}      Remove packages (alias: ${chalk.yellow(
    "remove"
  )}, ${chalk.yellow("rm")}, ${chalk.yellow("uni")})
    ${chalk.yellow(
      "create"
    )}         Initialize a new project (alias: ${chalk.yellow(
    "init"
  )}, ${chalk.yellow("c")})
    ${chalk.yellow(
      "publish"
    )}        Publish the current package to npm (alias: ${chalk.yellow("pub")})
    ${chalk.yellow(
      "unpublish"
    )}      Unpublish the current package from npm (alias: ${chalk.yellow(
    "unpub"
  )})
    ${chalk.yellow(
      "execute"
    )}        Run a node package script (like ${chalk.yellow(
    "npx <script>"
  )}, alias: ${chalk.yellow("exec")})


${chalk.bold("Examples:")}
    ${chalk.green("tnpm install")}
    ${chalk.green("tnpm i")} ${chalk.magenta("chalk express")}
    ${chalk.green("tnpm add")} ${chalk.magenta("chalk express")}
    ${chalk.green("tnpm get")} ${chalk.magenta("chalk express")}
    ${chalk.green("tnpm uninstall")} ${chalk.magenta("lodash")}
    ${chalk.green("tnpm create")}
    ${chalk.green("tnpm publish")}
    ${chalk.green("tnpm pub")}
    ${chalk.green("tnpm unpublish")}
    ${chalk.green("tnpm unpub")}
    ${chalk.green("tnpm execute")} ${chalk.magenta("start")}
    ${chalk.green("tnpm exec")} ${chalk.magenta("start")}
    ${chalk.green("tnpx")} ${chalk.magenta("start")}
    ${chalk.green("")}

${chalk.gray("https://github.com/myferr/tnpm")}
`);
}

const registry = "https://registry.npmjs.org/";

export { registry, showHelp };
