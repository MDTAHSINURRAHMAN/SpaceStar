export interface Order {
    _id: string;
    customer: {
      firstName: string;
      lastName: string;
      phone: string;
      email: string;
      address: string;
      city: string;
      postalCode: number;
      note?: string;
      discountCode?: string;
    };
    items: {
      name: string;
      quantity: number;
      price: number;
    }[];
    totalAmount: number;
    status: string;
    createdAt: string;
    updatedAt: string;
  }
  