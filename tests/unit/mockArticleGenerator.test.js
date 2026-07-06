/**
 * Unit tests for mockArticleGenerator.js
 *
 * Verifies random generation boundaries, key structure,
 * and status-conditional field rules.
 */

const { generateMockArticle, generateMultipleMockArticles } = require('../../src/backend/utils/mockArticleGenerator');

describe('generateMockArticle', () => {
   const authorId = 'author-uuid-123';
   const editorId = 'editor-uuid-456';

   it('should return an article object with all required properties', () => {
      const article = generateMockArticle(authorId, editorId);

      expect(article).toHaveProperty('title');
      expect(article).toHaveProperty('excerpt');
      expect(article).toHaveProperty('content');
      expect(article).toHaveProperty('category');
      expect(article.author_id).toBe(authorId);
      expect(article.editor_id).toBe(editorId);
      expect(article).toHaveProperty('status');
      expect(article).toHaveProperty('image');
      expect(article).toHaveProperty('readTime');
      expect(article).toHaveProperty('views');
      expect(article).toHaveProperty('publishedAt');
   });

   it('should set views to 0 if status is not published', () => {
      // Generate multiple times to get different statuses
      for (let i = 0; i < 50; i++) {
         const article = generateMockArticle(authorId, editorId);
         if (article.status !== 'published') {
            expect(article.views).toBe(0);
            expect(article.publishedAt).toBeNull();
         } else {
            expect(article.views).toBeGreaterThanOrEqual(0);
            expect(article.publishedAt).toBeInstanceOf(Date);
         }
      }
   });

   it('should pick a valid status', () => {
      const validStatuses = ['draft', 'pending', 'published', 'rejected'];
      for (let i = 0; i < 20; i++) {
         const article = generateMockArticle(authorId, editorId);
         expect(validStatuses).toContain(article.status);
      }
   });

   it('should set readTime between 2 and 11', () => {
      for (let i = 0; i < 50; i++) {
         const article = generateMockArticle(authorId, editorId);
         expect(article.readTime).toBeGreaterThanOrEqual(2);
         expect(article.readTime).toBeLessThanOrEqual(11);
      }
   });
});

describe('generateMultipleMockArticles', () => {
   const authorIds = ['author-1', 'author-2'];
   const editorIds = ['editor-1', 'editor-2'];

   it('should return the requested number of articles', () => {
      const count = 5;
      const articles = generateMultipleMockArticles(count, authorIds, editorIds);
      expect(articles).toHaveLength(count);
   });

   it('should assign author and editor ids from the provided arrays', () => {
      const count = 10;
      const articles = generateMultipleMockArticles(count, authorIds, editorIds);
      articles.forEach((article) => {
         expect(authorIds).toContain(article.author_id);
         expect(editorIds).toContain(article.editor_id);
      });
   });
});
