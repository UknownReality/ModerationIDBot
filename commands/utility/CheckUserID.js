const { SlashCommandBuilder } = require('discord.js');
const config = require('../../Configuration.json');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('getrobloxid')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to retrieve info for')
                .setRequired(false))
        .setDescription('Provides the user\'s Roblox ID.'),
    async execute(interaction) {
        const userOption = interaction.options.getUser('user');
        const guildID = interaction.guild.id;
        const userID = userOption ? userOption.id : interaction.user.id;
        const authToken = config.bloxlinkAuthToken;
        const fetch = (await import('node-fetch')).default;

        fetch(`https://api.blox.link/v4/public/guilds/${guildID}/discord-to-roblox/${userID}`, {
            headers: {
                "Authorization": authToken
            }
        })
        .then((response) => response.json())
        .then((data) => {
            interaction.reply(`User's Roblox ID: ${data.robloxID}`);
        })
        .catch((error) => {
            console.error('Error fetching data:', error);
            interaction.reply('Failed to retrieve Roblox ID.');
        });
    },
};
