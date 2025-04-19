const instruments_map = require("./instruments_map.json");

function mapnoteblocks(bot) {
	const result = [];
	for (x = -4; x <= 4; x++) {
		for (y = -4; y <= 4; y++) {
			for (z = -4; z <= 4; z++) {
				const pos = bot.blockAt(bot.entity.position.offset(x, y, z));
				const blockAbove = bot.blockAt(bot.entity.position.offset(x, y + 1, z));

				if (pos.name === "note_block" && (blockAbove.name === "air" || blockAbove.name === "cave_air" || blockAbove.name === "void_air")) {
					const NBInfo = getNoteBlockInfo(pos);
					pos.pitch = NBInfo.pitch === undefined ? 0 : NBInfo.pitch;
					pos.instrumentid = NBInfo.instrumentid === undefined ? 0 : NBInfo.instrumentid;

					result.push(pos);
				}
			}
		}
	}
	return result;
}

function noteblockInfoFromMetadata(metadata) {
	const instrumentid = Math.floor(metadata / 50);
	let pitch;

	if ((metadata % 2) === 0) {
		pitch = metadata / 2;
	} else {
		pitch = ((metadata - 1) / 2) + 1;
	}

	pitch = pitch - instrumentid * 25;
    pitch = pitch - 1;

	const instrument = instruments_map.lowercase[instrumentid];
	return { instrument: instrument, instrumentid: instrumentid, pitch: pitch };
}

function getNoteBlockInfo(block) {
	if (block == null)
		return console.log("Block was null!");
	if (block.name == null || block.metadata == null)
		return console.log("Block name or metadata was null!"); //should never happen
	if (block.name !== "note_block")
		return console.log("Expected name 'note_block' got " + block.name);

	return noteblockInfoFromMetadata(block.metadata);
}

module.exports = {
	mapnoteblocks,
};