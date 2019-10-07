import { Chapter, Page } from '../../manga_types';
import { MangaSource } from '../manga_source';

const CHAPTER_PAGE_COUNT = 30;

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export class TestPageProvider extends MangaSource {
  async getChapters(manga:

  async getChapter(chapter: Chapter): Promise<Chapter | null> {
    if (chapterRef.chapterNumber < 0) {
      return null;
    }

    // Lookup chapter in the cache first
    const cached = this.chapterCache.get(Chapter.toChapterKey(chapterRef));
    if (cached) {
      return cached;
    }

    // Simulate loading time
    await delay(1000);

    const chapter:  = {
      chapterRef,
      pages: [],
    };
    chapter.getPages = Array(CHAPTER_PAGE_COUNT).fill(0).map((_, i) =>
        new Page(chapter, i, () => this.createPage(chapterRef, i))),
    this.chapterCache.set(Chapter.toChapterKey(chapterRef), chapter);

    return chapter;
  }

  private async createPage(chapterRef: Chapter, pageNumber: number): Promise<string> {
    const canvas = document.createElement('canvas');
    canvas.width = 500;
    canvas.height = 800;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error("couldn't retrieve canvas context");
    }
    ctx.font = '16px serif';
    ctx.fillStyle = 'blue';
    ctx.fillText(`Chapter ${chapterRef.chapterNumber}, page ${pageNumber}`, 30, 30);

    const uri = canvas.toDataURL('image/png');

    // Simulate loading time
    await delay(1000);
    return uri;
  }
}