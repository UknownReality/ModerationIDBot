async function startBoostersUpdater(guildId, boosterRoleId, authToken) {
    const fetch = await import('node-fetch');
    const fs = await import('fs');
    const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
    const client = new Client({ intents: [GatewayIntentBits.Guilds] });

    setInterval(updateBoostersList, 20000);

    async function updateBoostersList() {
        const guild = client.guilds.cache.get(guildId);
        if (!guild) return;

        const boosterRole = guild.roles.cache.get(boosterRoleId);
        if (!boosterRole) return;

        let boosters = [];

        guild.members.cache.forEach(member => {
            if (member.roles.cache.has(boosterRoleId)) {
                fetchRobloxID(member.user.id)
                    .then(robloxID => {
                        if (robloxID) {
                            boosters.push(robloxID);
                        }
                    })
                    .catch(error => {
                        console.error('Error fetching Roblox ID:', error);
                    });
            }
        });

        setTimeout(() => {
            handleBoosters(boosters);
        }, 5000); // Wait for 5 seconds for all fetches to complete before handling the list
    }

    async function fetchRobloxID(userID) {
        const response = await fetch(`https://api.blox.link/v4/public/guilds/${guildId}/discord-to-roblox/${userID}`, {
            headers: {
                "Authorization": authToken
            }
        });
        if (response.ok) {
            const data = await response.json();
            return data.robloxID;
        } else {
            throw new Error('Failed to fetch Roblox ID');
        }
    }

    function handleBoosters(boosters) {
        // You can implement your logic here to handle the list of boosters
        console.log('List of boosters:', boosters);
        // For example, you can write the list to a file
        fs.writeFileSync('boosters.txt', boosters.join('\n'));
    }
}

module.exports = { startBoostersUpdater };
