-- Update agent categories in the agents table
-- Move sales agents to 'Voice Agents' category
-- Move social media agents to 'nhancio' category (Automations)

-- Update sales agents to Voice Agents category
UPDATE agents
SET category = 'Voice Agents'
WHERE "Name" ILIKE '%sales%'
   OR "Name" ILIKE '%representative%'
   OR type = 'voice'
   OR category = 'Sales';

-- Update social media agents to nhancio category (Automations)
UPDATE agents
SET category = 'nhancio'
WHERE "Name" ILIKE '%social media%'
   OR "Name" ILIKE '%social%'
   OR type = 'social_media'
   OR category = 'Social Media';

-- Verify the changes
SELECT id, "Name", category, type
FROM agents
WHERE category IN ('Voice Agents', 'nhancio')
ORDER BY category, "Name"; 