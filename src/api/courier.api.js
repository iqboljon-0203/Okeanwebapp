import { supabase } from '../lib/supabase';

export const fetchAvailableOrders = async () => {
    try {
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('status', 'new')
            .is('courier_id', null)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error fetching available orders:', error);
        throw error;
    }
};

export const acceptOrder = async (orderId, courierId) => {
    try {
        const { data, error } = await supabase
            .from('orders')
            .update({
                courier_id: courierId,
                status: 'pending',
                accepted_at: new Date().toISOString()
            })
            .eq('id', orderId)
            .select() // Return the updated record
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error accepting order:', error);
        throw error;
    }
};

export const fetchMyActiveOrder = async (courierId) => {
    if (!courierId) return null;
    try {
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('courier_id', courierId)
            .eq('status', 'pending')
            .maybeSingle(); // Use maybeSingle to return null instead of error if no active order

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error fetching active order:', error);
        throw error;
    }
};

export const completeOrder = async (orderId) => {
    try {
        const { data, error } = await supabase
            .from('orders')
            .update({
                status: 'delivered',
                delivered_at: new Date().toISOString()
            })
            .eq('id', orderId)
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error completing order:', error);
        throw error;
    }
};

export const fetchCourierHistory = async (courierId) => {
    if (!courierId) return [];
    try {
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('courier_id', courierId)
            .eq('status', 'delivered')
            .order('delivered_at', { ascending: false });

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error fetching history:', error);
        throw error;
    }
};
