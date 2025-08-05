import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import whiskeyBottle from '@/assets/whiskey-bottle.png';
import ginBottle from '@/assets/gin-bottle.png';
import tequilaBottle from '@/assets/tequila-bottle.png';
import orangeLiqueurBottle from '@/assets/orange-liqueur-bottle.png';
import amarettoBottle from '@/assets/amaretto-bottle.png';
import coffeeLiqueurBottle from '@/assets/coffee-liqueur-bottle.png';
import tonicWaterBottle from '@/assets/tonic-water-bottle.png';
import gingerBeerBottle from '@/assets/ginger-beer-bottle.png';
import cranberryJuiceBottle from '@/assets/cranberry-juice-bottle.png';

const mockUserId = '12345678-1234-1234-1234-123456789012';

// Mock inventory data for fallback
const mockItems = [
  {
    id: '1',
    name: 'Rittenhouse Rye Whiskey',
    category: 'spirits',
    description: 'A 100-proof straight rye whiskey perfect for classic cocktails like Manhattans and Old Fashioneds. Known for its spicy character and ability to cut through citrus and bitters.',
    quantity: 1,
    picture_url: whiskeyBottle,
    user_id: mockUserId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Hendrick\'s Gin',
    category: 'spirits',
    description: 'A super premium gin with a distinctive flavor profile featuring cucumber and rose petal. Perfect for gin & tonics and cocktails that benefit from its unique botanical blend.',
    quantity: 1,
    picture_url: ginBottle,
    user_id: mockUserId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Espolòn Tequila Blanco',
    category: 'spirits',
    description: 'A premium 100% agave tequila with bright, fresh agave flavor. Ideal for margaritas, palomas, and other tequila-forward cocktails.',
    quantity: 1,
    picture_url: tequilaBottle,
    user_id: mockUserId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '4',
    name: 'Cointreau',
    category: 'liqueurs',
    description: 'Premium orange liqueur essential for classic cocktails like Margaritas, Cosmopolitans, and Sidecars. Made from sweet and bitter orange peels.',
    quantity: 1,
    picture_url: orangeLiqueurBottle,
    user_id: mockUserId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '5',
    name: 'Disaronno Amaretto',
    category: 'liqueurs',
    description: 'Italian almond liqueur perfect for Amaretto Sours and adding depth to whiskey cocktails. Sweet with notes of almond and vanilla.',
    quantity: 2,
    picture_url: amarettoBottle,
    user_id: mockUserId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '6',
    name: 'Kahlúa Coffee Liqueur',
    category: 'liqueurs',
    description: 'Rich coffee liqueur essential for White Russians, Espresso Martinis, and other coffee-forward cocktails. Made with real coffee beans.',
    quantity: 1,
    picture_url: coffeeLiqueurBottle,
    user_id: mockUserId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '7',
    name: 'Fever-Tree Tonic Water',
    category: 'mixers',
    description: 'Premium tonic water made with natural quinine. The gold standard for gin & tonics and other tonic-based cocktails.',
    quantity: 4,
    picture_url: tonicWaterBottle,
    user_id: mockUserId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '8',
    name: 'Fever-Tree Ginger Beer',
    category: 'mixers',
    description: 'Spicy, aromatic ginger beer perfect for Moscow Mules and Dark & Stormy cocktails. Made with three types of ginger.',
    quantity: 2,
    picture_url: gingerBeerBottle,
    user_id: mockUserId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '9',
    name: 'Ocean Spray Cranberry Juice',
    category: 'mixers',
    description: 'Essential mixer for Cosmopolitans, Cape Codders, and other cranberry-based cocktails. Adds tartness and beautiful color.',
    quantity: 2,
    picture_url: cranberryJuiceBottle,
    user_id: mockUserId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Set up mock authentication once with proper JWT structure for RLS
const setupMockAuth = async () => {
  const mockJWT = {
    sub: mockUserId,
    aud: 'authenticated', 
    role: 'authenticated',
    email: 'yiru.yao@example.com',
    user_metadata: { name: 'Yiru Yao' },
    app_metadata: {},
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
  };

  await supabase.auth.setSession({
    access_token: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(JSON.stringify(mockJWT))}.mock-signature`,
    refresh_token: 'mock-refresh-token',
    user: {
      id: mockUserId,
      email: 'yiru.yao@example.com',
      user_metadata: { name: 'Yiru Yao' },
      app_metadata: {},
      aud: 'authenticated',
      role: 'authenticated',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  } as any);
};

// Fetch items from database
const fetchItems = async () => {
  // Check if user is authenticated - do NOT auto-sign in
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error('No authenticated session - user must sign in');
  }
  
  const userId = session.user?.id;
  if (!userId) {
    throw new Error('No user ID found in session');
  }

  const { data, error } = await supabase
    .from('items')
    .select('*')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching items:', error);
    return [];
  }
  return data || [];
};

// Custom hook for managing items
export const useItems = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const {
    data: items = [],
    isLoading,
    error,
    refetch,
    isFetching
  } = useQuery({
    queryKey: ['items', user?.id], // Include user ID in query key
    queryFn: fetchItems,
    staleTime: 0, // Force fresh data to see deleted_at filter effect
    gcTime: 0, // Don't cache to ensure fresh queries
    refetchOnWindowFocus: false, // Prevent refetch on tab focus to reduce flashing
    refetchOnMount: true, // Force refetch to see updated filter
    enabled: !!user, // Only fetch when user is authenticated
  });

  // Mutation for adding items
  const addItemMutation = useMutation({
    mutationFn: async (newItem: any) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No authenticated session');
      
      const { data, error } = await supabase
        .from('items')
        .insert([{
          ...newItem,
          user_id: session.user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate and refetch items
      queryClient.invalidateQueries({ queryKey: ['items'] });
    },
  });

  // Mutation for updating items
  const updateItemMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No authenticated session');
      
      const { data, error } = await supabase
        .from('items')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', session.user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate and refetch items
      queryClient.invalidateQueries({ queryKey: ['items'] });
    },
  });

  // Mutation for deleting items
  const deleteItemMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No authenticated session');
      
      const { error } = await supabase
        .from('items')
        .delete()
        .eq('id', id)
        .eq('user_id', session.user.id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      // Invalidate and refetch items
      queryClient.invalidateQueries({ queryKey: ['items'] });
    },
  });

  // Group items by category
  const itemsByCategory = items.reduce((acc: Record<string, any[]>, item: any) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {});

  return {
    items,
    itemsByCategory,
    isLoading: isLoading && items.length === 0, // Only show loading if we have no data
    isRefreshing: isFetching && items.length > 0, // Background refresh
    error,
    refetch,
    addItem: addItemMutation.mutate,
    updateItem: updateItemMutation.mutate,
    deleteItem: deleteItemMutation.mutate,
    isAddingItem: addItemMutation.isPending,
    isUpdatingItem: updateItemMutation.isPending,
    isDeletingItem: deleteItemMutation.isPending,
  };
};