const DOMAIN = 'https://img.keittokirja.inkku.xyz';

const R2_BASE_URL = DOMAIN || '/recipes/img';


export function recipeImageCandidates(recipeId: string, imagePath?: string): string[] {
    return [
        imagePath,
        `${R2_BASE_URL}/${recipeId}.png`,
        `${R2_BASE_URL}/${recipeId}.jpg`,
        `${R2_BASE_URL}/${recipeId}.jpeg`,
    ].filter((c): c is string => !!c);
}
