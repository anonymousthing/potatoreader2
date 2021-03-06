import React from 'react';
import { createPageList } from './page_list/create';
import { Reader } from './reader';
import { ReaderPresenter, ReaderStore } from './reader_presenter';
import { MangaSource } from './manga_source/manga_source';

export function createReader(source: MangaSource, seriesId: string) {
  const store = new ReaderStore();
  const presenter = new ReaderPresenter();

  const PageList = createPageList(source, seriesId);

  return React.memo(() => <Reader PageList={PageList} />);
}
