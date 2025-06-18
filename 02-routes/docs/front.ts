import {processJsonCreateTask} from "../../04-shared/workerPool";

interface QueryParams {
    doc_id: string;
}
interface ApiResponse {
    data: Record<string, any>;
    status: boolean;
}
export default async ({ query }: { query: QueryParams }): Promise<ApiResponse> => {
    try {

        const json = await processJsonCreateTask({
            doc_id: query.doc_id,
        })

        return {
            data: json,
            status: true,
        };
    } catch (e: any){
        console.log(e)
        if(e?.response?.status && e?.response?.statusText)throw { message: e.response.statusText, code: e.response.status };
        else  throw { message: 'Не получилось сформировать json', code: 400 };
    }
}