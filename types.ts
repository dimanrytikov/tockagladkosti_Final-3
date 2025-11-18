

export interface Service {
    id: string;
    category: string;
    title: string;
    description: string;
    price: number;
    duration: string;
    buttonText: string;
}

export interface ServiceCategory {
    id: string;
    title: string;
    icon: string;
    description: string;
    services: Service[];
}

export interface CosmeticProduct {
    name: string;
    subtitle?: string;
    theme: string;
    description: string;
    activeComponents: string[];
    variants: {
        size: string;
        price: number;
    }[];
    imageUrl?: string;
}

export interface CosmeticTab {
    id: string;
    title: string;
    icon?: string;
    heading: string;
    description: string;
    products: CosmeticProduct[];
}

export interface CosmeticsBrandData {
    id:string;
    name: string;
    tagline: string;
    tabs: CosmeticTab[];
}

export interface CalculatorZone {
    id: string;
    name: string;
    price: number;
    label: string;
    originalPrice?: number;
}

export interface CalculatorCategory {
    id:string;
    title: string;
    icon?: string;
    zones: CalculatorZone[];
}

export interface ModalData {
    name: string;
    price: number | 'Консультация' | 'по прайсу';
    isComplex: boolean;
    zones?: string[];
}

export interface CartItem {
    id: string; // Unique ID, e.g., 'service-lifting' or 'product-NMF-Foam-200ml'
    name: string;
    details: string; // e.g., 'Курс из 5 сеансов' or '200 мл'
    price: number; // Price for the item (total for course, or per unit for product)
    quantity: number; // For products. For services, it will be 1.
    type: 'service' | 'product';
    // Store original object for reference
    productRef?: CosmeticProduct; 
    serviceRef?: Service;
}