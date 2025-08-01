-- Create a test user profile for demonstration purposes
INSERT INTO public.profiles (user_id, first_name, last_name, email) VALUES 
('00000000-0000-0000-0000-000000000001', 'Yiru', 'Yao', 'yiru82@gmail.com');

-- Sample Spirits
INSERT INTO public.items (name, category, description, quantity, user_id, picture_url) VALUES 
('Rittenhouse Rye Whiskey', 'spirits', 'A 100-proof straight rye whiskey perfect for classic cocktails like Manhattans and Old Fashioneds. Known for its spicy character and ability to cut through citrus and bitters.', 1, '00000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400'),
('Hendrick''s Gin', 'spirits', 'A distinctive gin infused with cucumber and rose petals, offering a unique botanical profile that works beautifully in gin and tonics or martinis.', 1, '00000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400'),
('Espolòn Tequila Blanco', 'spirits', 'A premium 100% blue agave tequila with bright, crisp flavor perfect for margaritas and other agave-based cocktails. Clean finish with hints of pepper and citrus.', 1, '00000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1606467278097-3e6a3eaa4fb8?w=400');

-- Sample Liqueurs  
INSERT INTO public.items (name, category, description, quantity, user_id, picture_url) VALUES
('Cointreau Triple Sec', 'liqueurs', 'Premium French orange liqueur made from sweet and bitter orange peels. Essential for classics like Margaritas, Cosmopolitans, and Sidecars.', 1, '00000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1578912996078-305d92249aa6?w=400'),
('Disaronno Amaretto', 'liqueurs', 'Italian almond liqueur with a distinctive sweet almond flavor and smooth finish. Perfect for Amaretto Sours or as a dessert drink ingredient.', 1, '00000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1541532713592-79a0317b6b9d?w=400'),
('Kahlúa Coffee Liqueur', 'liqueurs', 'Rich Mexican coffee liqueur made with rum, sugar, and arabica coffee. Essential for White Russians, Espresso Martinis, and Mudslides.', 1, '00000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400');

-- Sample Mixers
INSERT INTO public.items (name, category, description, quantity, user_id, picture_url) VALUES
('Fever-Tree Tonic Water', 'mixers', 'Premium tonic water made with natural quinine from the Congo. Provides the perfect bitter balance for gin and tonics with its crisp, clean taste.', 4, '00000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1605029103232-bc7cf0f3b3df?w=400'),
('Q Ginger Beer', 'mixers', 'Artisanal ginger beer with real ginger and agave. Spicy and refreshing, perfect for Moscow Mules, Dark & Stormys, and other ginger cocktails.', 2, '00000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1639317632997-4e1bfed3c294?w=400'),
('Ocean Spray Cranberry Juice', 'mixers', 'Classic cranberry juice cocktail with sweet-tart flavor. Essential for Cosmopolitans, Cape Codders, and adding color to mixed drinks.', 1, '00000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1582434142716-405ea16e8df8?w=400');