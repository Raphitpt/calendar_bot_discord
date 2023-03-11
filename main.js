const ical = require('node-ical');
const Discord = require('discord.js');
const client = new Discord.Client({
  intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MESSAGES]
});
// Configuration
const calendarURL = 'http://upplanning.appli.univ-poitiers.fr/jsp/custom/modules/plannings/anonymous_cal.jsp?resources=24838&projectId=13&calType=ical&nbWeeks=15'; // URL du calendrier ICS
const channelId = '838701492650246175'; // ID du salon Discord où afficher les événements

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
  scheduleJob();
});

// Fonction pour récupérer les événements du lendemain
function getEvents() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const events = [];
    ical.fromURL(calendarURL, {}, (err, data) => {
      if (err) {
        console.error(err);
        return;
      }
      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          const event = data[key];
          const start = new Date(event.start);
          if (start && start.toDateString() === tomorrow.toDateString()) {
            events.push(event);
          }
        }
      }
      if (events.length > 0) {
        postEvents(events);
      } else {
        console.log("Pas d'évènement demain");
      }
    });
  }
  
  // Fonction pour vérifier si une date est demain
  function isTomorrow(date) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return date.toDateString() === tomorrow.toDateString();
  }
  
  // Fonction pour vérifier si une date est aujourd'hui
  function isToday(date) {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }
  
  // Fonction pour vérifier si une date est après-demain
  function isAfterTomorrow(date) {
    const afterTomorrow = new Date();
    afterTomorrow.setDate(afterTomorrow.getDate() + 2);
    return date.toDateString() === afterTomorrow.toDateString();
  }

// Fonction pour afficher les événements dans le salon Discord
function postEvents(events) {
    const channel = client.channels.cache.get(channelId);
    const embed = new Discord.MessageEmbed()
    .setTitle(":calendar_spiral: Emploi du temps du jour")
    .setURL("https://upplanning.appli.univ-poitiers.fr/direct/myPlanningUP.html")
    .setDescription("")
    .setColor("#f74f18")
    .setThumbnail("https://img.icons8.com/fluent/48/000000/google-calendar--v2.png");
    
    let fields = '';
    
    events.forEach((event) => {
      const start = new Date(event.start);
      const end = new Date(event.end);
      const startTime = start.toLocaleTimeString('fr-FR', {hour: 'numeric', minute: 'numeric'});
      const endTime = end.toLocaleTimeString('fr-FR', {hour: 'numeric', minute: 'numeric'});
      // On ne prend en compte que les évènements dont l'heure de début est comprise entre 8h et 18h
      if (start.getHours() >= 8 && start.getHours() < 18) {
        event_desc = event.description.replace(/\([^)]*\)/g, '').trim();
        fields += "**🕝 " + startTime + " à " + endTime + "**\n\n**" + event.summary + "**\n\n" + event.location + "\n" + event_desc + "\n\n-------------------\n\n";
      }
    });
  
    const author_name = client.user.username;
    let formattedDate = new Date();
    formattedDate.setDate(formattedDate.getDate() + 1);
    formattedDate = formattedDate.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    embed.setFooter(`Pour le ${formattedDate}, fait par ${author_name}`);
    embed.setDescription(fields);
    
    channel.send({ embeds: [embed] });
  }


client.on('messageCreate', message => {
    // Vérifie si le message est une commande et s'il provient d'un utilisateur autorisé
    if (message.content === '!demain' && message.author.id === '345494234691796992') {
      // Récupère les événements à poster
      const events = getEvents();
      console.log("Message reçus");
      // Déclenche l'envoi des événements dans le canal spécifié
      postEvents(events);
    }
  });

// Planification de la fonction pour chaque soir à 19h
function scheduleJob() {
  const CronJob = require('cron').CronJob;
  new CronJob('*/1 * * * *', () => {
    console.log('Posting events for tomorrow');
    getEvents();
  }, null, true, 'Europe/Paris');
}

client.login('ODM4MTI4ODM5NDU1NDA4MTY4.GXeebI.TsqVRE388uFS_06Me9pvN_8kwZARq3NeAOhPow');