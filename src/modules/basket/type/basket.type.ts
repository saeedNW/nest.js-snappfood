export type TFoodItemsInBasket = {
	foodId: number;
	name: string;
	description?: string;
	count: number;
	image?: string;
	price: number;
	total_amount: number;
	discount_amount: number;
	payment_amount: number;
	discountCode?: string;
	supplierId: number;
	supplierName?: string;
	supplierImage?: string;
};

export type TBasketType = {
	total_amount: number;
	paymentAmount: number;
	totalDiscountAmount: number;
	foodList: TFoodItemsInBasket[];
	generalDiscountDetail: any;
};
