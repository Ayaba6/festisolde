import { supabase } from './supabaseClient'

export const cart = {
  addItem: async (userId: string, productId: string, quantity = 1) => {
    const { data: existingItems } = await supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', userId)
      .eq('product_id', productId)

    if (existingItems && existingItems.length > 0) {
      const item = existingItems[0]
      await supabase
        .from('cart_items')
        .update({ quantity: item.quantity + quantity })
        .eq('id', item.id)
    } else {
      await supabase
        .from('cart_items')
        .insert({ user_id: userId, product_id: productId, quantity })
    }
  },

  getItems: async (userId: string) => {
    const { data } = await supabase
      .from('cart_items')
      .select('*, products(*)')
      .eq('user_id', userId)
    return data || []
  },

  removeItem: async (id: string) => {
    await supabase.from('cart_items').delete().eq('id', id)
  }
}
