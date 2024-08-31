const { Client, Collection, Partials, GatewayIntentBits } = require('discord.js');

const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { Token, ClientID } = require("./config.json");

const client = new Client({
  intents: [Object.keys(GatewayIntentBits)],
  partials: [Object.keys(Partials)]
});

console.log(`
██████╗██╗      ██████╗ ██╗   ██╗██████╗     ███████╗███████╗██████╗ ██╗   ██╗██╗ ██████╗███████╗███████╗
██╔════╝██║     ██╔═══██╗██║   ██║██╔══██╗    ██╔════╝██╔════╝██╔══██╗██║   ██║██║██╔════╝██╔════╝██╔════╝
██║     ██║     ██║   ██║██║   ██║██║  ██║    ███████╗█████╗  ██████╔╝██║   ██║██║██║     █████╗  ███████╗
██║     ██║     ██║   ██║██║   ██║██║  ██║    ╚════██║██╔══╝  ██╔══██╗╚██╗ ██╔╝██║██║     ██╔══╝  ╚════██║
╚██████╗███████╗╚██████╔╝╚██████╔╝██████╔╝    ███████║███████╗██║  ██║ ╚████╔╝ ██║╚██████╗███████╗███████║
╚═════╝╚══════╝ ╚═════╝  ╚═════╝ ╚═════╝     ╚══════╝╚══════╝╚═╝  ╚═╝  ╚═══╝  ╚═╝ ╚═════╝╚══════╝╚══════╝`);

/* ---------------------------------------- Handling ---------------------------------------- */
client.login(Token);
module.exports = client;
client.commands = new Collection();
client.events = new Collection();
client.slashCommands = new Collection();
['commands', 'events', 'slash'].forEach(handler => {
    require(`./handlers/${handler}`)(client);
});

/* ---------------------------------------- Register SlashCmd ---------------------------------------- */
const commands = client.slashCommands.map(({ execute, ...data }) => data);
const rest = new REST({ version: '10' }).setToken(Token);
  rest.put(  
    Routes.applicationCommands(ClientID), { body: commands },
  ).catch(console.error)

/* ---------------------------------------- Read Modal ---------------------------------------- */

const db = require('pro.db');

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isModalSubmit()) return;

  if (interaction.customId === 'updateProduct') {
  
    const oldName = interaction.fields.getTextInputValue('oldName');
    const newName = interaction.fields.getTextInputValue('newName');
    const newPrice = interaction.fields.getTextInputValue('newPrice');
    const newLink = interaction.fields.getTextInputValue('newLink');

    const foundProducts = await db.get(`Products`, { productName: oldName });

    let theProductName;
    if (Array.isArray(foundProducts) && foundProducts.length > 0) {
          
      const selectedProduct = foundProducts.find(product => product.productName === oldName);
      if (selectedProduct) {
        theProductName = selectedProduct.productName;
      } else {
        return interaction.reply({ content: `** قم بإدخال إسم منتج صحيح**`, ephemeral: true });
      }
    }

    if(isNaN(newPrice)) return interaction.reply({ content: `**قم إدخال سعر المنتج بطريقة صحيحة.**`, ephemeral:true });

    const checkData = await db.get(`Products`);
    const removingProduct = checkData.filter(re => re.productName !== theProductName);
    await db.set(`Products`, removingProduct);

    await db.push(`Products`, {
      productName: newName,
      productPrice: newPrice,
      productLink: newLink
    });

    interaction.reply({ content: `** تم تعديل المنتج بنجاح**` });

  }
});