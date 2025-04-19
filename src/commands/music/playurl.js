const name = "playurl";
const aliases = ["purl", "pu"];
const description = "Play a url instead of a file";
const usage = "{prefix}playurl <url>";
const enabled = true;

const util = require("../../util.js");
const parser = require("../../parser.js");
const config = require("../../../config.json");
const blockmapper = require("../../block-mapper.js");
const download = require("../../songdownloader.js").download;
const toNotebot = require("../../converter/miditonotebot").toNotebot;

const fs = require("fs");
const path = require("path");

function execute(bot, cmd, username, args, handler) {
    if (args.length === 0) {
        return bot.chat(util.errorMessage(`Usage: ${handler.prefix}playurl <url>`));
    }
    if (bot.player.gamemode !== 0) {
        bot.chat(util.errorMessage("Bot is not in survival mode!"));
        return;
    }
    if (parser.isPlaying() === true) {
        bot.chat(util.errorMessage("Bot is already playing a song"));
        return;
    }
    if (parser.isTuning() === true) {
        bot.chat(util.errorMessage("Bot is tuning"));
        return;
    }
    const urlObj = new URL(args[0].toString());
    if (urlObj.protocol === "https:" || urlObj.protocol === "http:") {
        bot.chat(util.infoMessage("Starting download..."));
        util.wait(80).then(() => tryDownload(urlObj.toString(), bot, username));
    } else {
        return bot.chat(util.errorMessage(`hm something went wrong while parsing url: ${urlObj.toString()}`));
    }
}

function tryDownload(url, bot, username) {
    const start = Date.now();
    download(url, undefined, (err, file) => {
        if (err) {
            console.log(`failed download in ${Date.now() - start}ms! ${err}`);
            bot.chat(util.errorMessage(`Failed to download file: ${err}`));
        } else {
            bot.chat(util.infoMessage(`Finished downloading took &e${Date.now() - start}&7ms`));
            console.log(`finished download in ${Date.now() - start}ms! ${file}`);

            toNotebot(file, (filename, err) => {
                if (err || filename === undefined) {
                    util.wait(200).then(() => bot.chat(util.errorMessage(err === undefined ? "Failed to parse midi file to notebot format" : err.replace("\u0000", "\u2400"))));
                    console.log(util.errorMessage(err === undefined ? "Failed to parse midi file to notebot format" : err));

                } else {
                    let noteblocks = blockmapper.mapnoteblocks(bot);
                    bot.chat(util.infoMessage(`Found &b${noteblocks.length}&7 noteblocks!`));

                    parser.tuneNoteblocks(filename, noteblocks, true, (success, error) => {
                        if (success) {
                            util.wait(80).then(() => bot.chat(util.infoMessage(success)));
                            util.wait(200).then(() => {
                                const songName = path.basename(filename).replace(".txt", "");
                                parser.editNowPlaying(songName, 0, undefined, url, username);
                                bot.chat(util.infoMessage(`Now playing &e${songName}`));
                                parser.play(bot, noteblocks, filename);
                                config.settings.save_downloaded_songs ? undefined : fs.unlink(filename, () => { });
                            });
                        } else if (error) {
                            util.wait(80).then(() => bot.chat(util.errorMessage(error)));
                            config.settings.save_downloaded_songs ? undefined : fs.unlink(filename, () => { });
                        } else {
                            console.log(`The playing of song ${filename} has been cancelled manually`);
                            util.wait(80).then(() => bot.chat(util.infoMessage(`The playing of song &b${file.replace("./songs/", "").replace(".txt", "")}&7 has been cancelled manually`)));
                            config.settings.save_downloaded_songs ? undefined : fs.unlink(filename, () => { });
                        }
                    });
                }
            });
        }
    });
}

module.exports.name = name;
module.exports.aliases = aliases;
module.exports.description = description;
module.exports.usage = usage;
module.exports.enabled = enabled;
module.exports.execute = execute;