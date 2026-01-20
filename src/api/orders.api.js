export const createOrder = async (orderData) => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Basic validation shim
  if (!orderData.items || orderData.items.length === 0) {
    throw new Error('Savat bo\'sh');
  }
  
  console.log('Order created:', orderData);
  return {
    success: true,
    orderId: 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
    ...orderData
  };
};
