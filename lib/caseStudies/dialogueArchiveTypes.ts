export type DialogueArchiveManifest = {
  generatedAt: string;
  itemCount: number;
  liveComponentCount: number;
  groups: { id: string; label: string; count: number }[];
  items: {
    id: string;
    group: string;
    sha: string;
    shaShort: string;
    date: string;
    datePt: string;
    file: string;
    src: string;
    width: number;
    height: number;
  }[];
  chatIconCommits: { sha: string; date: string; subject: string }[];
  chatIconHistory: {
    sha: string;
    shaShort: string;
    date: string;
    datePt: string;
    src: string;
    width: number;
    height: number;
    agreed?: boolean;
  }[];
  exportRoutes: { path: string; note: string }[];
};
