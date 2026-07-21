const { runResearchScraper } = require('./src/backend/services/researchScraperService');

async function forceScrape() {
  await runResearchScraper();
  setTimeout(() => process.exit(0), 2000);
}

forceScrape();
