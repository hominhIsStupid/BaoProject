-- Migration: 005_mascot_system

CREATE TABLE IF NOT EXISTS mascot_settings (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(50) DEFAULT 'Người Rồng',
    volume INTEGER DEFAULT 100,
    behavior_mode VARCHAR(20) DEFAULT 'active', -- active, quiet, off
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS mascot_outfits (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL, -- body, wing, tail, accessory
    asset_data JSONB NOT NULL, -- configuration or sprite paths for rendering
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS mascot_inventory (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    outfit_id INTEGER REFERENCES mascot_outfits(id) ON DELETE CASCADE,
    is_equipped BOOLEAN DEFAULT false,
    acquired_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, outfit_id)
);

-- Insert some default outfits
INSERT INTO mascot_outfits (name, type, asset_data) VALUES
('Default Coat', 'body', '{"color": "0x0E0E0E"}'),
('Gold Wings', 'wing', '{"color": "0xC4A44A"}'),
('Ice Tail', 'tail', '{"color": "0x88CCFF"}'),
('Magic Book', 'accessory', '{"type": "book"}')
ON CONFLICT DO NOTHING;
