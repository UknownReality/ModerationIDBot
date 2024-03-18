const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to retrieve info for')
                .setRequired(false))
        .setDescription('Provides information about the user.'),
    async execute(interaction) {
        const userOption = interaction.options.getUser('user');
    
        let usericonUrl, username, createdAt;
        if (userOption) {
            usericonUrl = userOption.displayAvatarURL();
            if (!usericonUrl) {
                usericonUrl = userOption.defaultAvatarURL;
            }
            username = userOption.username;
            createdAt = userOption.createdAt.toLocaleString();
        } else {
            usericonUrl = interaction.user.displayAvatarURL();
            if (!usericonUrl) {
                usericonUrl = interaction.user.defaultAvatarURL;
            }
            username = interaction.user.username;
            createdAt = interaction.user.createdAt.toLocaleString();
        }
    
        const exampleEmbed = {
            color: 0x0099FF,
            title: 'Information about ' + username,
            thumbnail: { url: usericonUrl },
            fields: [
                { name: 'Username', value: username, inline: true },
                { name: 'Account Creation Date', value: createdAt, inline: true },
            ],
            timestamp: new Date(),
            footer: { text: 'User info provided by .unknown_reality', iconURL: usericonUrl }
        };
    
        await interaction.reply({ embeds: [exampleEmbed] });
    },
};
