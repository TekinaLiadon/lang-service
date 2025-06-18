import { t } from "elysia";

const InnerObject = t.Record(t.String(), t.Any());

const SectionObject = t.Record(t.String(), InnerObject);

const LanguagesObject = t.Record(t.String({ pattern: '^[a-z]{2}$' }), SectionObject);
export default {
    query: t.Object({
        doc_id: t.String({
            error: "Неверный doc_id",
        }),
    }),
    response: {
        200: t.Object(
            {
                status: t.Boolean(),
                data: LanguagesObject,
            },{
                description: "Структура ответа",
            }),
        400: t.Object(
            {
                status: t.Boolean(),
                message: t.String(),
            },
            {
                description: "В message причина почему не получилось сформировать json",
            }
        ),
        404: t.Object(
            {
                status: t.Boolean(),
                message: t.String(),
            },
            {
                description: "Скорее всего документ с данным id не найден",
            }
        ),
    },
    detail: {
        tags: ["Docs"],
        description: "Получение json языков для фронтенда",
        summary: "1.1 Получение Front json",
        // deprecated: true,
    },
};