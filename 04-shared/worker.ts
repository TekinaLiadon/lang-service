import uniq from "lodash.uniq";
import * as XLSX from "xlsx";
import {GoogleSpreadsheet} from "google-spreadsheet";
import {JWT} from "google-auth-library";

declare var self: Worker;

type SheetRow = Record<string, any>;
type SheetData = SheetRow[];
type Workbook = XLSX.WorkBook;

var getAllSheetValues = (workbook: Workbook): SheetData[] =>
    workbook.SheetNames.map((item) =>
        XLSX.utils.sheet_to_json(workbook.Sheets[item])
    );
var getAllDifferentLang = (data: SheetData[]): string[] =>
    uniq(
        data
            .flat()
            .map(item => Object.keys(item).slice(1))
            .flat()
    );
function getJson(langs: string[], workbook: Workbook, data: SheetData[]):Record<string, any> {
    const result = {};
    for (const lang of langs.flat()) {
        result[lang] = {};
        workbook.SheetNames.forEach((sheet, idx) => {
            result[lang][sheet] = Object.fromEntries(
                data[idx].map(item => {
                    const [attr] = Object.values(item);
                    return [attr, item[lang]];
                })
            );
        });
    }
    return result;
}

self.onmessage = async (event: MessageEvent) => {
    const { id, payload } = event.data;
    let result = {};
    const serviceAccountAuth = new JWT({
        email: Bun.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        key: Bun.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const doc = new GoogleSpreadsheet(payload.doc_id, serviceAccountAuth);
    await doc.loadInfo();
    const xlsxBuffer = await doc.downloadAsXLSX();
    const workbook = XLSX.read(xlsxBuffer);
    const data = getAllSheetValues(workbook);
    const langs = getAllDifferentLang(data);
    result = getJson(langs, workbook, data);
    self.postMessage({ id, result });
};