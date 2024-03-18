const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
const config = require('../../Configuration.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('autocheck')
        .addStringOption(option =>
            option.setName('assetid')
                .setDescription('The item ID to auto check')
                .setRequired(true))
        .setDescription('Auto checks for mod status.'),
    async execute(interaction) {
        const itemOption = interaction.options.getString('assetid');
        if (itemOption) {
            try {
                let assetInfo = await getAssetInfo(itemOption, config.RobloxApiKey);
                let assetInfoExtra = await getAssetModStatus(itemOption);

                if (assetInfoExtra.state !== 'Completed') {
                    await interaction.reply('Moderation status is not yet completed. Checking again every 30 seconds...');
                    while (assetInfoExtra.state !== 'Completed') {
                        await new Promise(resolve => setTimeout(resolve, 30000));
                        assetInfoExtra = await getAssetModStatus(itemOption);
                    }
                }

                let moderationSymbol = '';
                switch (assetInfo.moderationResult.moderationState) {
                    case 'Approved':
                        moderationSymbol = ':white_check_mark:';
                        break;
                    case 'Reviewing':
                        moderationSymbol = ':hourglass_flowing_sand:';
                        break;
                    case 'Rejected':
                        moderationSymbol = ':x:';
                        break;
                    default:
                        moderationSymbol = 'Unknown';
                }

                const exampleEmbed = {
                    color: 0x0099FF,
                    title: 'Information about ' + (assetInfo.displayName ? assetInfo.displayName : `Item ID ${itemOption}`),
                    fields: [
                        { name: 'Asset ID', value: assetInfo.assetId },
                        { name: 'Asset Type', value: assetInfo.assetType },
                        { name: 'Description', value: assetInfo.description || 'No description available' },
                        { name: 'Moderation State', value: `${assetInfo.moderationResult.moderationState} ${moderationSymbol}` },
                        { name: 'Creator Group ID', value: assetInfo.creationContext.creator.groupId }
                    ],
                    thumbnail: { url: assetInfoExtra.imageUrl },
                    timestamp: new Date(),
                    footer: { text: 'Item info provided by .unknown_reality' }
                };

                await interaction.reply({ embeds: [exampleEmbed] });
            } catch (error) {
                console.error('Error fetching asset information:', error.message);
                await interaction.reply('Failed to fetch asset information.');
            }
        } else {
            await interaction.reply('Please provide an item ID.');
        }
    }
};

async function getAssetInfo(assetId, apiKey) {
    try {
        const response = await axios.get(`https://apis.roblox.com/assets/v1/assets/${assetId}`, {
            headers: {
                'x-api-key': apiKey
            }
        });

        if (response.status === 200) {
            console.log(response.data);
            return response.data;
        } else {
            throw new Error(`Failed to fetch asset information. Status code: ${response.status}`);
        }
    } catch (error) {
        throw new Error(`Failed to fetch asset information: ${error.message}`);
    }
}

async function getAssetModStatus(assetId) {
    try {
        const response = await axios.get(`https://thumbnails.roblox.com/v1/assets?assetIds=${assetId}&returnPolicy=PlaceHolder&size=420x420&format=Png`);
        
        console.log("Response status:", response.status);
        console.log("Response data:", response.data);

        if (response.status === 200) {
            const data = response.data;
            if (data && data.data && data.data.length > 0) {
                console.log(data.data[0]);
                return data.data[0];
            } else {
                throw new Error('Asset not found or moderation status not available.');
            }
        } else {
            throw new Error(`Failed to fetch moderation status. Status code: ${response.status}`);
        }
    } catch (error) {
        throw new Error(`Failed to fetch moderation status: ${error.message}`);
    }
}
