-- Temporarily remove foreign key constraints
ALTER TABLE public.items DROP CONSTRAINT IF EXISTS items_user_id_fkey;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;

-- Create a test user profile for our mock user
INSERT INTO public.profiles (user_id, first_name, last_name, email) VALUES 
('12345678-1234-1234-1234-123456789012', 'Yiru', 'Yao', 'yiru.yao@example.com');

-- Insert mock items for test user
INSERT INTO public.items (name, category, description, quantity, user_id, picture_url) VALUES
('Rittenhouse Rye Whiskey', 'spirits', 'A 100-proof straight rye whiskey perfect for classic cocktails like Manhattans and Old Fashioneds. Known for its spicy character and ability to cut through citrus and bitters.', 1, '12345678-1234-1234-1234-123456789012', '/src/assets/whiskey-bottle.png'),
('Hendrick''s Gin', 'spirits', 'A distinctive gin infused with cucumber and rose petals, offering a unique botanical profile that works beautifully in gin and tonics or martinis.', 1, '12345678-1234-1234-1234-123456789012', '/src/assets/gin-bottle.png'),
('Espolòn Tequila Blanco', 'spirits', 'A premium 100% blue agave tequila with bright, crisp flavor perfect for margaritas and other agave-based cocktails. Clean finish with hints of pepper and citrus.', 1, '12345678-1234-1234-1234-123456789012', '/src/assets/tequila-bottle.png'),
('Cointreau Triple Sec', 'liqueurs', 'Premium French orange liqueur made from sweet and bitter orange peels. Essential for classics like Margaritas, Cosmopolitans, and Sidecars.', 1, '12345678-1234-1234-1234-123456789012', '/src/assets/orange-liqueur-bottle.png'),
('Disaronno Amaretto', 'liqueurs', 'Italian almond liqueur with a distinctive sweet almond flavor and smooth finish. Perfect for Amaretto Sours or as a dessert drink ingredient.', 1, '12345678-1234-1234-1234-123456789012', '/src/assets/amaretto-bottle.png'),
('Kahlúa Coffee Liqueur', 'liqueurs', 'Rich Mexican coffee liqueur made with rum, sugar, and arabica coffee. Essential for White Russians, Espresso Martinis, and Mudslides.', 1, '12345678-1234-1234-1234-123456789012', '/src/assets/coffee-liqueur-bottle.png'),
('Fever-Tree Tonic Water', 'mixers', 'Premium tonic water made with natural quinine from the Congo. Provides the perfect bitter balance for gin and tonics with its crisp, clean taste.', 4, '12345678-1234-1234-1234-123456789012', '/src/assets/tonic-water-bottle.png'),
('Q Ginger Beer', 'mixers', 'Artisanal ginger beer with real ginger and agave. Spicy and refreshing, perfect for Moscow Mules, Dark & Stormys, and other ginger cocktails.', 2, '12345678-1234-1234-1234-123456789012', '/src/assets/ginger-beer-bottle.png'),
('Ocean Spray Cranberry Juice', 'mixers', 'Classic cranberry juice cocktail with sweet-tart flavor. Essential for Cosmopolitans, Cape Codders, and adding color to mixed drinks.', 1, '12345678-1234-1234-1234-123456789012', '/src/assets/cranberry-juice-bottle.png');