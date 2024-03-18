const { SlashCommandBuilder, Client } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
//1180015189463154759 -- guild id
module.exports = {
	data: new SlashCommandBuilder()
		.setName('serverinfo')
		.setDescription('Provides information about the server.'),
	async execute(interaction) {
        var guildmembercount = interaction.guild.memberCount.toString();
        var guildiconUrl = interaction.guild.iconURL({ dynamic: true });
        if (guildiconUrl == null) {
            guildiconUrl = interaction.iconURL;
        } else {
            guildiconUrl = interaction.guild.iconURL({ dynamic: true }).toString();
        };
        const exampleEmbed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle('Information about ' + interaction.guild.name)
        //.setURL('https://discord.js.org/')
        //.setAuthor({ name: 'Some name', iconURL: 'https://i.imgur.com/AfFp7pu.png', url: 'https://discord.js.org' })
        //.setDescription('Some description here')
        .setThumbnail(guildiconUrl)
        .addFields(
            { name: 'Server Name', value: interaction.guild.name, inline: true },
            { name: 'Member Count', value: guildmembercount, inline: true},
        )
        //.setImage('https://i.imgur.com/AfFp7pu.png')
        .setTimestamp()
        .setFooter({ text: 'Server info provided by UnknownReality', iconURL: guildiconUrl });
        await interaction.reply({ embeds: [exampleEmbed] })
		//await interaction.reply(`This server is ${interaction.guild.name} and has ${interaction.guild.memberCount} members.`);
	},
};