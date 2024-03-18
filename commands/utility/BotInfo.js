const { SlashCommandBuilder, Client } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const { sleep } = require('../../extraUtilities/misc.js');
const os = require('node:os');
const osutils = require('os-utils');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('botinfo') // DO NOT CAPITALIZE ANYTHING!!!
		.setDescription('Provides information about the bot.'),
	async execute(interaction) {
        const fetchingEmbed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle('Fetching Info...')
            .setThumbnail(Client.iconURL)
            .setTimestamp()
            .setFooter({ text: 'Bot info provided by UnknownReality'});
        await interaction.reply({ embeds: [fetchingEmbed] });
        sleep(500);
        osutils.cpuUsage(function(cpuUsagePercent) {
            console.log('CPU Usage (%): ' + cpuUsagePercent);
            cpuUsagePercent = parseFloat(cpuUsagePercent.toFixed(2));
            const totalram = (os.totalmem() / 10**6 + " ").split('.')[0];
            const freeram = (os.freemem() / 10**6 + " ").split('.')[0];
            const usedram = ((os.totalmem() - os.freemem()) / 10**6 + " ").split('.')[0];
            const prctfreeram = ((os.freemem() * 100) / os.totalmem + " ").split('.')[0];
            const cpuCoreCount = os.cpus().length;
            const finalEmbed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle('Bot Info')
                .setThumbnail(Client.iconURL)
                .addFields(
                    { name: 'Bot Version', value: 'Pre Alpha 0.01', inline: true },
                    { name: ':gear: CPU', value: `Cpu Usage: ${cpuUsagePercent}%\nCpu Cores: ${cpuCoreCount / 2} Cores\nCpu Threads: ${cpuCoreCount} Threads\n`, inline: true },
                    { name: ':film_frames: Memory (RAM)', value: `Total Memory: ${totalram}MB\nUsed Memory: ${usedram}MB\nFree Memory: ${freeram}MB\nPercentage Of Free Memory: ${prctfreeram}%`, inline: true },
                )
                .setTimestamp()
                .setFooter({ text: 'Bot info provided by UnknownReality'});
            interaction.editReply({ embeds: [finalEmbed] });
        });
	},
};
