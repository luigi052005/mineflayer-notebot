const mineflayer = require("mineflayer");
const cmd_handler = require("./src/command-handler.js");
const util = require("./src/util.js");
const config = require("./config.json");


const options = {
        username: config.bot.username || "notebot",
        password: config.bot.password,
        auth: config.bot.auth,
        host: config.bot.host || "localhost",
        port: config.bot.port || 25565,
        version: "1.20.4",
        checkTimeoutInterval: 5555 * 1000,
};

const bot = mineflayer.createBot(options);
cmd_handler();

bot.on("login", () => {
    console.log(`(${bot.username}) logged in!`);
    //bot.chat(util.colors("&bnotebot&7 v&9"+botVersion+"&7 made by &eMorganAnkan&7 updated by Luigi"))
});

bot.on("chat", (username, message) => {
    console.log(`[chat] <${username}> ${message}`);

  if (message.startsWith(cmd_handler.prefix)) {
      const args = message.slice(cmd_handler.prefix.length).split(" ");
      const command = args.shift();

      if (cmd_handler.isCommand(command)) {
        console.log(`[command] <${command}> ${command}`);
      let output = cmd_handler.execute(bot, command, username, args);

      if (output.status === "success") {
        if (typeof output.message == "string")
          bot.chat(util.infoMessage(output.message));
      } else if (output.status === "error") {
        if (typeof output.message == "string")
          bot.chat(util.errorMessage(output.message));
      }
    }
  }
});

module.exports.getBot = () => {
	return bot;
}