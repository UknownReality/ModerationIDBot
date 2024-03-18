const fs = require('node:fs');
const path = require('node:path');
const { Client, Events, GatewayIntentBits } = require('discord.js');
const http = require('http');

const config = require('./Configuration.json');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });

client.commands = new Map();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

client.once(Events.ClientReady, async readyClient => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
    // Start the server after the bot is logged in
    startServer();
    // Update boosters list after the bot is logged in
    await updateBoostersList();
    setInterval(updateBoostersList, 30000);
});

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;
    const command = client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
        } else {
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    }
});

const PORT = 22211;
const SERVER_IP = '0.0.0.0';
const BOOSTERS_FILE_PATH = 'boosters.txt';

async function startServer() {
    const server = http.createServer(async (req, res) => {
        console.log('Received request:', req.method, req.url);
        if (req.method === 'POST' && req.url === '/checkrole') {
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });

            req.on('end', async () => {
                try {
                    const data = JSON.parse(body);
                    console.log('Received data:', data);
                    const hasRole = await checkRole(data.guild, data.user, data.role);

                    console.log('Has role:', hasRole);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ hasRole: hasRole }));
                } catch (error) {
                    console.error('Error parsing request body:', error);
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Invalid request body' }));
                }
            });
        } else {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Not found');
        }
    });

    server.listen(PORT, SERVER_IP, () => {
        console.log(`Server is running on http://${SERVER_IP}:${PORT}`);
    });
}

async function checkRole(guild, user, role) {
    try {
        const boosterList = await getBoosters();
        return boosterList.includes(user);
    } catch (error) {
        console.error('Error checking role:', error);
        return false;
    }
}

async function getBoosters() {
    try {
        const fileContents = await fs.promises.readFile(BOOSTERS_FILE_PATH, 'utf-8');
        const boosterList = fileContents.split('\n').map(id => id.trim()); // Trim whitespace and convert to string
        console.log(boosterList);
        return boosterList;
    } catch (error) {
        console.error('Error reading boosters file:', error);
        return [];
    }
}


async function fetchRobloxID(userID) {
    try {
        const response = await fetch(`https://api.blox.link/v4/public/guilds/${config.guildId}/discord-to-roblox/${userID}`, {
            headers: {
                "Authorization": config.bloxlinkAuthToken
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch Roblox ID');
        }
        
        const data = await response.json();
        return data.robloxID;
    } catch (error) {
        throw error;
    }
}

async function updateBoostersList() {
    try {
        const guild = await client.guilds.fetch(config.guildId);
        if (!guild) {
            console.log(`Guild with ID ${config.guildId} not found`);
            return;
        }

        let boosters = [];
        const role = guild.roles.cache.get(config.boosterRoleId);
        let members;
        try {
            members = await guild.members.fetch();
        } catch (error) {
            console.error('Error fetching members:', error);
            return;
        }
        
        for (const member of members.values()) {
            console.log(`User ID: ${member.user.id}`);
            if (member.roles.cache.has(config.boosterRoleId)) {
                try {
                    const roID = await fetchRobloxID(member.user.id);
                    if (roID) {
                        boosters.push(roID);
                    }
                } catch (error) {
                    console.error('Error fetching Roblox ID:', error);
                }
            }
        }

        handleBoosters(boosters);
    } catch (error) {
        console.error('Failed to update boosters list:', error);
    }
}

function handleBoosters(boosters) {
    console.log('List of boosters:', boosters);
    fs.writeFileSync('boosters.txt', boosters.join('\n'));
}

client.login(config.token);