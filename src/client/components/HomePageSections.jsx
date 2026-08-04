import React, { useState, useEffect, useRef } from 'react';
import { CategorySection } from './CategorySection';
import { HorizontalSection } from './HorizontalSection';
import { articlesAPI } from '../utils/api';

export function LazyCategorySection({ title, icon, slug, accentColor }) {
   const [articles, setArticles] = useState(null);
   const [isVisible, setIsVisible] = useState(false);
   const sectionRef = useRef(null);

   useEffect(() => {
      const observer = new IntersectionObserver(
         ([entry]) => {
            if (entry.isIntersecting) {
               setIsVisible(true);
               observer.disconnect();
            }
         },
         { rootMargin: '200px' }
      );
      if (sectionRef.current) observer.observe(sectionRef.current);
      return () => observer.disconnect();
   }, []);

   useEffect(() => {
      if (isVisible && articles === null) {
         articlesAPI
            .getByCategory(slug, 4, 0)
            .then((data) => {
               setArticles(data || []);
            })
            .catch((err) => {
               console.error(err);
               setArticles([]);
            });
      }
   }, [isVisible, slug, articles]);

   if (articles !== null && articles.length === 0) {
      return null;
   }

   return (
      <div ref={sectionRef} style={articles === null ? { minHeight: '300px' } : {}}>
         {articles === null ? (
            <div
               style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '100%',
                  minHeight: '300px',
               }}
            >
               <div className="loading-spinner" style={{ color: accentColor }}>
                  Đang tải {title}...
               </div>
            </div>
         ) : (
            <CategorySection title={title} icon={icon} slug={slug} articles={articles} accentColor={accentColor} />
         )}
      </div>
   );
}

export function LazyHorizontalSection({ title, icon, slug, accentColor }) {
   const [articles, setArticles] = useState(null);
   const [isVisible, setIsVisible] = useState(false);
   const sectionRef = useRef(null);

   useEffect(() => {
      const observer = new IntersectionObserver(
         ([entry]) => {
            if (entry.isIntersecting) {
               setIsVisible(true);
               observer.disconnect();
            }
         },
         { rootMargin: '200px' }
      );
      if (sectionRef.current) observer.observe(sectionRef.current);
      return () => observer.disconnect();
   }, []);

   useEffect(() => {
      if (isVisible && articles === null) {
         articlesAPI
            .getByCategory(slug, 4, 0)
            .then((data) => {
               setArticles(data || []);
            })
            .catch((err) => {
               console.error(err);
               setArticles([]);
            });
      }
   }, [isVisible, slug, articles]);

   if (articles !== null && articles.length === 0) {
      return null;
   }

   return (
      <div ref={sectionRef} style={articles === null ? { minHeight: '300px' } : {}}>
         {articles === null ? (
            <div
               style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '100%',
                  minHeight: '300px',
               }}
            >
               <div className="loading-spinner" style={{ color: accentColor }}>
                  Đang tải {title}...
               </div>
            </div>
         ) : (
            <HorizontalSection title={title} icon={icon} slug={slug} articles={articles} accentColor={accentColor} />
         )}
      </div>
   );
}
