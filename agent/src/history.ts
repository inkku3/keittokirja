export interface HistoryEntry {
    task: string;
    summary: string;
    success: boolean;
    timestamp: Date;
}

export class History {
    entries: HistoryEntry[] = [];

    add(entry: HistoryEntry) {
        this.entries.push(entry);
    }
}
