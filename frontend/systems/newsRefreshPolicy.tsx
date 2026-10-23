// Server scheduler: 02:00 Asia/Seoul. Date arithmetic is independent of device timezone.
export function newsRefreshWindow(now = Date.now()) {
    const kst = new Date(now + 9 * 60 * 60 * 1000);
    const day = kst.toISOString().slice(0, 10);
    const afterRefresh = kst.getUTCHours() >= 2;
    const nextRefreshAt = Date.parse(`${day}T02:00:00+09:00`) + (afterRefresh ? 86400000 : 0);
    return { day, afterRefresh, nextRefreshAt };
}
export function hasCurrentNews(data: Record<string, { published: string }>, day: string) {
    const items = Object.values(data);
    return items.length > 0 && items.every(item => /^\d{4}-\d{2}-\d{2}/.test(item.published) && item.published.slice(0, 10) >= day);
}
