const fetch = require('fetch');
const fs = require('fs');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');

const config = require('../../Configuration.json');

module.exports = {
    async execute() {
        setInterval(updateBoostersList, 20000);
    }
}

function updateBoostersList() {
    const guild = Client.guilds.cache.get(config.guildId);
    if (!guild) return;

    const boosterRoleID = config.boosterRoleId;
    const boosterRole = guild.roles.cache.get(boosterRoleID);
    if (!boosterRole) return;

    let boosters = [];

    guild.members.cache.forEach(member => {
        if (member.roles.cache.has(boosterRoleID)) {
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

function fetchRobloxID(userID) {
    return fetch(`https://api.blox.link/v4/public/guilds/${config.guildId}/discord-to-roblox/${userID}`, {
        headers: {
            "Authorization": config.authToken
        }
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error('Failed to fetch Roblox ID');
        }
    })
    .then(data => {
        return data.robloxID;
    })
    .catch(error => {
        console.error('Error fetching data:', error);
        return null;
    });
}

function handleBoosters(boosters) {
    // You can implement your logic here to handle the list of boosters
    console.log('List of boosters:', boosters);
    // For example, you can write the list to a file
    fs.writeFileSync('boosters.txt', boosters.join('\n'));
}
