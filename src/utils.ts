export const HTTP_STATUSES = {
    OK_200: 200,
    CREATED_201: 201,
    NO_CONTENT_204: 204,
    BAD_REQUEST_400: 400,
    NOT_FOUND_404: 404
}

export const validateRequiredStringDataFromBody = (value: unknown,
                                                   field: string,
                                                   maxLength: number) => {
    if (!value || typeof value !== 'string' || !value.trim() || value.length > maxLength) {
        return createErrorObject(field)
    }
    return
}

export const createErrorObject = (field: string) => ({
    field,
    message: `Invalid ${field} data`
})
