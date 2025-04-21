export interface Company {
    _id: string;
    name: string;
    description?: string;
    website?: string;
    logo?: string;
    address?: {
        street?: string;
        city?: string;
        state?: string;
        country?: string;
        postalCode?: string;
    };
    contact?: {
        email?: string;
        phone?: string;
    };
    settings?: {
        currency?: string;
        timezone?: string;
        language?: string;
    };
    metadata?: Record<string, unknown>;
    createdAt: Date;
    updatedAt: Date;
    isDeleted?: boolean;
    deletedAt?: Date;
}

export interface CompanyMember {
    userId: string;
    companyId: string;
    role: "admin" | "member" | "viewer";
    joinedAt: Date;
    metadata?: Record<string, unknown>;
} 