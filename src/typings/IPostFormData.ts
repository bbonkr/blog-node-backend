export interface IPostFormData {
    title?: string;
    slug?: string;
    markdown?: string;
    coverImage?: string;
    categories?: IPostCategoryFormData[];
    tags: IPostTagFormData[];
}

export interface IPostCategoryFormData {
    id?: number;
    slug?: string;
    name?: string;
}

export interface IPostTagFormData {
    id?: number;
    slug?: string;
    name?: string;
}
