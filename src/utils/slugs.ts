export function teamNameToSlug(name: string): string {
    return name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/['']/g, '')
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
}

export function cityIdToSlug(id: string): string {
    return id.replace(/_/g, '-');
}

export function slugToCityId(slug: string): string {
    return slug.replace(/-/g, '_');
}
