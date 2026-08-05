// South Africa uses day/month/year (e.g. 30/07/2026). This turns a
// yyyy-mm-dd date string (as returned by the API) into that format,
// regardless of the browser's own locale.
export function formatDateSA(dateStr) {

    if (!dateStr) return "";

    const [year, month, day] = dateStr.split("-");

    if (!year || !month || !day) return dateStr;

    return `${day}/${month}/${year}`;

}
