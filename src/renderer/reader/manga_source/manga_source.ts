import { Chapter, Page, PageRange } from '../manga_types';

const PAGE_REQUEST_LIMIT = 100;

export abstract class MangaSource {
  // Map from chapter key to Chapter
  protected chapterCache: Map<string, Chapter> = new Map();

  abstract getChapter(chapter: Chapter): Promise<Chapter | null>;

  /**
   * Takes a starting PageRef and a number of additional pages to request, and expands it into a full
   * array of Pages for each page in the range.
   *
   * Requesting a negative number of pages will return pages before `origin`.
   * @param origin
   * @param morePageCount
   */
  async getMorePages(origin: Page, morePageCount: number): Promise<readonly Page[]> {
    const pages = [];
    let currentPage: Page = origin;

    if (morePageCount > 0) {
      for (let i = 0; i < morePageCount; i++) {
        const nextPage = await this.getNextPageRef(currentPage);
        if (!nextPage) {
          // No more pages.
          break;
        }
        currentPage = nextPage;
        pages.push(currentPage);
      }
    } else {
      for (let i = 0; i > morePageCount; i--) {
        const previousPage = await this.getPreviousPageRef(currentPage);
        if (!previousPage) {
          // No more pages.
          break;
        }
        currentPage = previousPage;
        pages.unshift(currentPage);
      }
    }
    return pages;
  }

  /**
   * Takes a PageRange and expands it into a full array of PageRefs, for each
   * page in the range.
   *
   * This function requires that range[0] comes before range[1].
   */
  async expandPageRange(range: PageRange): Promise<Page[]> {
    const pages = [];

    let currentPage: Page = range[0];
    let pageCount = 0;
    while (!Page.compare(currentPage, range[1])) {
      pages.push(currentPage);
      const nextPage = await this.getNextPageRef(currentPage);
      if (!nextPage) {
        // No more pages.
        break;
      }
      currentPage = nextPage;
      console.log(`Expanding page ${Page.toShortString(currentPage)}`);

      // Safeguard against accidentally requesting too many pages (e.g. passing invalid PageRanges)
      pageCount++;
      if (pageCount > PAGE_REQUEST_LIMIT) {
        throw new Error('requested too many pages');
      }
    }

    return pages;
  }

  /**
   * Increments a PageRef, resolving to the next chapter if there are no more pages in the current
   * chapter.
   */
  private async getNextPageRef(p: Page): Promise<Page | null> {
    // If we're on the last page of the chapter, move to the next chapter
    if (p.pageNumber === p.chapter.getPages.length - 1) {
      // Try to get first page of the next chapter
      const nextChapter = p.chapter.nextChapter;
      if (nextChapter) {
        return (await nextChapter.getPages())[0];
      }
      // No more pages.
      return null;
    }
    return (await p.chapter.getPages())[p.pageNumber + 1];
  }

  /**
   * Decrements a PageRef, resolving to the previous chapter if the specified page is the first page.
   */
  private async getPreviousPageRef(p: Page): Promise<Page | null> {
    if (p.pageNumber === 0) {
      // There are no chapters before the first one.
      if (p.chapterNumber === 0) {
        return null;
      }

      // Try to get last page of the previous chapter
      const previousChapter = p.chapter.previousChapter;
      if (!previousChapter) {
        return null;
      }
      return (await previousChapter.getPages())[previousChapter.getPages.length - 1];
    }
    return (await p.chapter.getPages())[p.pageNumber - 1];
  }
}