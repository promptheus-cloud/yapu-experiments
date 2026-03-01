import fs from 'fs';
import path from 'path';

const contentDir = path.join(process.cwd(), 'content', 'data');

export function readContent<T>(page: string, locale: string): T {
  const localePath = path.join(contentDir, locale, `${page}.json`);
  const fallbackPath = path.join(contentDir, 'en', `${page}.json`);
  const filePath = fs.existsSync(localePath) ? localePath : fallbackPath;
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as T;
}

export function readSharedContent<T>(file: string): T {
  const filePath = path.join(contentDir, 'shared', `${file}.json`);
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as T;
}

export function contentExists(page: string, locale: string): boolean {
  const localePath = path.join(contentDir, locale, `${page}.json`);
  const fallbackPath = path.join(contentDir, 'en', `${page}.json`);
  return fs.existsSync(localePath) || fs.existsSync(fallbackPath);
}
