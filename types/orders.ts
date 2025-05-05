export interface Order {
    _id: string;
    customer: {
      name: string;
      email: string;
      phone: string;
      address: string;
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
  