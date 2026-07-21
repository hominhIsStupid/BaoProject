const Parser = require('rss-parser');
const cheerio = require('cheerio');

const parser = new Parser();

async function scrapeFullResearchContent(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) return '';
    const html = await res.text();
    const $ = cheerio.load(html);
    
    let contentHtml = '';
    
    if (url.includes('vnexpress.net')) {
      $('.fck_detail').children().each((i, el) => {
        const tag = $(el).prop('tagName').toLowerCase();
        if (tag === 'p' && $(el).hasClass('Normal')) {
          contentHtml += `<p>${$(el).html()}</p>\n`;
        } else if (tag === 'figure') {
          const imgMeta = $(el).find('meta[itemprop="url"]').attr('content') || $(el).find('img').attr('src');
          let caption = $(el).find('figcaption').text().trim() || $(el).find('.Image').text().trim();
          
          if (imgMeta) {
            contentHtml += `
              <figure style="margin: 1.5rem 0; text-align: center;">
                <img src="${imgMeta}" alt="${caption}" style="max-width: 100%; border-radius: 8px;" />
                ${caption ? `<figcaption style="font-size: 0.9rem; color: #888; margin-top: 0.5rem;">${caption}</figcaption>` : ''}
              </figure>\n`;
          }
        } else if (tag === 'ul' || tag === 'ol') {
           contentHtml += `<${tag}>${$(el).html()}</${tag}>\n`;
        }
      });
      if (!contentHtml) {
        $('article.fck_detail p').each((i, el) => {
          contentHtml += `<p>${$(el).text().trim()}</p>\n`;
        });
      }
    } 
    return contentHtml;
  } catch (err) {
    return err.message;
  }
}

async function run() {
  const feed = await parser.parseURL('https://vnexpress.net/rss/khoa-hoc.rss');
  const item = feed.items[0];
  console.log("TITLE:", item.title);
  console.log("LINK:", item.link);
  const content = await scrapeFullResearchContent(item.link);
  console.log("CONTENT LENGTH:", content.length);
  console.log("CONTENT PREVIEW:", content.substring(0, 500));
}

run();
