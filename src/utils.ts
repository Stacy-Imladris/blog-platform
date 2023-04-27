export const HTTP_STATUSES = {
    OK_200: 200,
    CREATED_201: 201,
    NO_CONTENT_204: 204,
    BAD_REQUEST_400: 400,
    NOT_AUTHORIZED_401: 401,
    FORBIDDEN_403: 403,
    NOT_FOUND_404: 404
}

export const availableResolutionsArray = ['P144', 'P240', 'P360', 'P480', 'P720', 'P1080', 'P1440', 'P2160']

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

export const isResolutionsInvalid = (resolutions: string[]) => resolutions
    .some(el => !availableResolutionsArray.includes(el))
